import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsExport } from '../entities/analytics-export.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    @InjectRepository(AnalyticsExport)
    private readonly exportRepository: Repository<AnalyticsExport>,
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Create an export request
   */
  async createExportRequest(exportData: Partial<AnalyticsExport>): Promise<AnalyticsExport> {
    try {
      const exportRequest = this.exportRepository.create({
        ...exportData,
        status: 'pending'
      });
      
      return await this.exportRepository.save(exportRequest);
    } catch (error) {
      this.logger.error(`Error creating export request: ${error.message}`);
      throw new ProductivityException(`Failed to create export request: ${error.message}`);
    }
  }

  /**
   * Get user's export requests
   */
  async getUserExports(userId: string, status?: string): Promise<AnalyticsExport[]> {
    try {
      let query = this.exportRepository.createQueryBuilder('export')
        .where('export.userId = :userId', { userId });

      if (status) {
        query = query.andWhere('export.status = :status', { status });
      }

      return await query.orderBy('export.createdAt', 'DESC').getMany();
    } catch (error) {
      this.logger.error(`Error retrieving export requests for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve export requests: ${error.message}`);
    }
  }

  /**
   * Process an export request
   */
  async processExport(exportId: string, userId: string): Promise<AnalyticsExport> {
    try {
      const exportRequest = await this.exportRepository.findOne({
        where: { id: exportId, userId }
      });

      if (!exportRequest) {
        throw new ProductivityException('Export request not found');
      }

      // Update status to processing
      exportRequest.status = 'processing';
      await this.exportRepository.save(exportRequest);

      try {
        // Generate the export file based on data type and format
        const fileData = await this.generateExportFile(exportRequest);
        
        // Update with file information
        exportRequest.fileName = `export_${exportId}.${exportRequest.format}`;
        exportRequest.status = 'completed';
        exportRequest.completedAt = new Date();
        
        return await this.exportRepository.save(exportRequest);
      } catch (error) {
        exportRequest.status = 'failed';
        exportRequest.errorMessage = error.message;
        await this.exportRepository.save(exportRequest);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Error processing export ${exportId}: ${error.message}`);
      throw new ProductivityException(`Failed to process export: ${error.message}`);
    }
  }

  /**
   * Generate export file based on data type and format
   */
  private async generateExportFile(exportRequest: AnalyticsExport): Promise<any> {
    // In a real implementation, this would generate actual files
    // For now, we'll simulate the process
    
    switch (exportRequest.dataType) {
      case 'time_entries':
        return await this.generateTimeEntriesExport(exportRequest);
      case 'tasks':
        return await this.generateTasksExport(exportRequest);
      case 'summary':
        return await this.generateSummaryExport(exportRequest);
      default:
        throw new ProductivityException(`Unsupported data type: ${exportRequest.dataType}`);
    }
  }

  /**
   * Generate time entries export
   */
  private async generateTimeEntriesExport(exportRequest: AnalyticsExport): Promise<any> {
    let query = this.timeEntryRepository.createQueryBuilder('timeEntry')
      .where('timeEntry.userId = :userId', { userId: exportRequest.userId })
      .andWhere('timeEntry.startTime >= :startDate', { startDate: exportRequest.startDate })
      .andWhere('timeEntry.startTime <= :endDate', { endDate: exportRequest.endDate });

    if (exportRequest.filters && exportRequest.filters.projectId) {
      query = query.leftJoinAndSelect('timeEntry.task', 'task')
        .andWhere('task.projectId = :projectId', { projectId: exportRequest.filters.projectId });
    }

    const timeEntries = await query.getMany();
    
    // Format data based on export format
    switch (exportRequest.format) {
      case 'csv':
        return this.formatAsCSV(timeEntries);
      case 'excel':
        return this.formatAsExcel(timeEntries);
      case 'pdf':
        return this.formatAsPDF(timeEntries);
      default:
        throw new ProductivityException(`Unsupported format: ${exportRequest.format}`);
    }
  }

  /**
   * Generate tasks export
   */
  private async generateTasksExport(exportRequest: AnalyticsExport): Promise<any> {
    let query = this.taskRepository.createQueryBuilder('task')
      .where('task.userId = :userId', { userId: exportRequest.userId })
      .andWhere('task.createdAt >= :startDate', { startDate: exportRequest.startDate })
      .andWhere('task.createdAt <= :endDate', { endDate: exportRequest.endDate });

    if (exportRequest.filters && exportRequest.filters.projectId) {
      query = query.andWhere('task.projectId = :projectId', { projectId: exportRequest.filters.projectId });
    }

    const tasks = await query.getMany();
    
    // Format data based on export format
    switch (exportRequest.format) {
      case 'csv':
        return this.formatTasksAsCSV(tasks);
      case 'excel':
        return this.formatTasksAsExcel(tasks);
      case 'pdf':
        return this.formatTasksAsPDF(tasks);
      default:
        throw new ProductivityException(`Unsupported format: ${exportRequest.format}`);
    }
  }

  /**
   * Generate summary export
   */
  private async generateSummaryExport(exportRequest: AnalyticsExport): Promise<any> {
    // This would generate a summary report combining different data types
    // For now, we'll return a simple object
    return {
      summary: true,
      generatedAt: new Date()
    };
  }

  /**
   * Format time entries as CSV
   */
  private formatAsCSV(timeEntries: TimeEntry[]): string {
    if (timeEntries.length === 0) return '';
    
    // CSV header
    let csv = 'ID,Start Time,End Time,Duration (seconds),Task ID,Description\n';
    
    // CSV rows
    timeEntries.forEach(entry => {
      csv += `"${entry.id}","${entry.startTime.toISOString()}","${entry.endTime?.toISOString() || ''}",${entry.duration || 0},"${entry.taskId || ''}","${entry.description || ''}"\n`;
    });
    
    return csv;
  }

  /**
   * Format tasks as CSV
   */
  private formatTasksAsCSV(tasks: Task[]): string {
    if (tasks.length === 0) return '';
    
    // CSV header
    let csv = 'ID,Title,Description,Completed,Created At,Updated At,Project ID\n';
    
    // CSV rows
    tasks.forEach(task => {
      csv += `"${task.id}","${task.title}","${task.description || ''}",${task.completed},${task.createdAt.toISOString()},${task.updatedAt.toISOString()},"${task.projectId || ''}"\n`;
    });
    
    return csv;
  }

  /**
   * Format as Excel (simplified)
   */
  private formatAsExcel(data: any[]): any {
    // In a real implementation, this would use a library like exceljs
    // For now, we'll return a simplified representation
    return {
      format: 'excel',
      data: JSON.stringify(data)
    };
  }

  /**
   * Format tasks as Excel (simplified)
   */
  private formatTasksAsExcel(tasks: Task[]): any {
    return this.formatAsExcel(tasks);
  }

  /**
   * Format as PDF (simplified)
   */
  private formatAsPDF(data: any[]): any {
    // In a real implementation, this would use a library like pdfkit
    // For now, we'll return a simplified representation
    return {
      format: 'pdf',
      data: JSON.stringify(data)
    };
  }

  /**
   * Format tasks as PDF (simplified)
   */
  private formatTasksAsPDF(tasks: Task[]): any {
    return this.formatAsPDF(tasks);
  }

  /**
   * Get export by ID
   */
  async getExportById(exportId: string, userId: string): Promise<AnalyticsExport> {
    try {
      const exportRequest = await this.exportRepository.findOne({
        where: { id: exportId, userId }
      });

      if (!exportRequest) {
        throw new ProductivityException('Export request not found');
      }

      return exportRequest;
    } catch (error) {
      this.logger.error(`Error retrieving export ${exportId}: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve export: ${error.message}`);
    }
  }

  /**
   * Cancel an export request
   */
  async cancelExport(exportId: string, userId: string): Promise<void> {
    try {
      const exportRequest = await this.exportRepository.findOne({
        where: { id: exportId, userId }
      });

      if (!exportRequest) {
        throw new ProductivityException('Export request not found');
      }

      if (exportRequest.status === 'completed') {
        throw new ProductivityException('Cannot cancel a completed export');
      }

      exportRequest.status = 'cancelled';
      await this.exportRepository.save(exportRequest);
    } catch (error) {
      this.logger.error(`Error cancelling export ${exportId}: ${error.message}`);
      throw new ProductivityException(`Failed to cancel export: ${error.message}`);
    }
  }
}