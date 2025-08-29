import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataExport } from '../entities/data-export.entity';
import { DataExportDto } from '../dto/data-export.dto';
import { User } from '../../users/user.entity';
import { TasksService } from '../../tasks/tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { TimeBlocksService } from '../../time-blocks/time-blocks.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DataExportService {
  // Flag to disable async processing during tests
  private disableAsyncProcessing = false;

  constructor(
    @InjectRepository(DataExport)
    private dataExportRepository: Repository<DataExport>,
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private timeBlocksService: TimeBlocksService,
  ) {}

  // Method to disable async processing for testing
  setDisableAsyncProcessing(disable: boolean) {
    this.disableAsyncProcessing = disable;
  }

  async getDataExport(id: string, userId: string): Promise<DataExport> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Data export not found');
    }

    return dataExport;
  }

  async createDataExport(
    userId: string,
    dataExportDto: DataExportDto,
  ): Promise<DataExport> {
    const dataExport = this.dataExportRepository.create({
      userId,
      ...dataExportDto,
      status: 'pending',
    });

    const savedDataExport = await this.dataExportRepository.save(dataExport);
    
    // Trigger async export processing unless disabled for testing
    if (!this.disableAsyncProcessing) {
      setImmediate(() => {
        this.processDataExport(savedDataExport.id, userId).catch(error => {
          console.error('Error processing data export:', error);
        });
      });
    }
    
    return savedDataExport;
  }

  async updateDataExportStatus(
    id: string,
    userId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    fileName?: string,
  ): Promise<DataExport> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Data export not found');
    }

    dataExport.status = status;
    if (fileName) {
      dataExport.fileName = fileName;
    }
    if (status === 'completed') {
      dataExport.exportedAt = new Date();
    }

    return this.dataExportRepository.save(dataExport);
  }

  async deleteDataExport(id: string, userId: string): Promise<void> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Data export not found');
    }

    // Delete the export file if it exists
    if (dataExport.fileName) {
      const filePath = path.join(process.cwd(), 'exports', dataExport.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.dataExportRepository.remove(dataExport);
  }

  /**
   * Process data export asynchronously
   * @param exportId The ID of the export record
   * @param userId The ID of the user requesting the export
   */
  private async processDataExport(exportId: string, userId: string): Promise<void> {
    try {
      // Update status to processing
      await this.updateDataExportStatus(exportId, userId, 'processing');

      // Get the export record
      const dataExport = await this.getDataExport(exportId, userId);

      // Collect data based on data type
      let exportData: any = {};
      
      switch (dataExport.dataType) {
        case 'tasks':
          const [tasks] = await this.tasksService.findAll(userId);
          exportData.tasks = tasks;
          break;
        case 'projects':
          const projects = await this.projectsService.findAll(userId);
          exportData.projects = projects;
          break;
        case 'time-blocks':
          const timeBlocks = await this.timeBlocksService.findAll(userId);
          exportData.timeBlocks = timeBlocks;
          break;
        case 'all':
        default:
          const [allTasks] = await this.tasksService.findAll(userId);
          const allProjects = await this.projectsService.findAll(userId);
          const allTimeBlocks = await this.timeBlocksService.findAll(userId);
          exportData = {
            tasks: allTasks,
            projects: allProjects,
            timeBlocks: allTimeBlocks,
          };
          break;
      }

      // Generate file based on format
      const fileName = await this.generateExportFile(exportData, dataExport.format, exportId);
      
      // Update status to completed with file name
      await this.updateDataExportStatus(exportId, userId, 'completed', fileName);
    } catch (error) {
      console.error('Error processing data export:', error);
      // Update status to failed
      try {
        await this.updateDataExportStatus(exportId, userId, 'failed');
      } catch (updateError) {
        console.error('Error updating export status to failed:', updateError);
      }
    }
  }

  /**
   * Generate export file based on format
   * @param data The data to export
   * @param format The export format (json, csv, pdf)
   * @param exportId The export ID for file naming
   * @returns The generated file name
   */
  private async generateExportFile(data: any, format: 'json' | 'csv' | 'pdf', exportId: string): Promise<string> {
    // Ensure exports directory exists
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const fileName = `export-${exportId}-${new Date().getTime()}.${format}`;
    const filePath = path.join(exportDir, fileName);

    switch (format) {
      case 'json':
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        break;
      case 'csv':
        // For CSV, we'll just convert the first array in the data object
        const dataArray = Object.values(data)[0];
        if (Array.isArray(dataArray)) {
          const csvContent = this.convertToCSV(dataArray);
          fs.writeFileSync(filePath, csvContent);
        } else {
          // If no array found, convert the entire object
          const csvContent = this.convertToCSV([data]);
          fs.writeFileSync(filePath, csvContent);
        }
        break;
      case 'pdf':
        // For PDF, we'll create a simple text representation
        const pdfContent = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, pdfContent);
        break;
    }

    return fileName;
  }

  /**
   * Convert array of objects to CSV format
   * @param data Array of objects to convert
   * @returns CSV string
   */
  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and wrap in quotes if needed
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}