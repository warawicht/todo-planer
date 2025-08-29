import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Project } from '../../projects/entities/project.entity';
import { TimeEntryDto } from '../dto/time-entry.dto';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class TimeReportingService {
  private readonly logger = new Logger(TimeReportingService.name);

  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  /**
   * Generate a detailed time report for a user
   */
  async generateTimeReport(
    userId: string,
    startDate: Date,
    endDate: Date,
    projectId?: string,
    taskId?: string,
  ): Promise<any> {
    try {
      // Build the query for time entries
      let query = this.timeEntryRepository.createQueryBuilder('timeEntry')
        .leftJoinAndSelect('timeEntry.task', 'task')
        .where('timeEntry.userId = :userId', { userId })
        .andWhere('timeEntry.startTime >= :startDate', { startDate })
        .andWhere('timeEntry.startTime <= :endDate', { endDate });

      if (projectId) {
        query = query.andWhere('task.projectId = :projectId', { projectId });
      }

      if (taskId) {
        query = query.andWhere('timeEntry.taskId = :taskId', { taskId });
      }

      const timeEntries = await query.getMany();

      // Calculate total duration
      let totalDuration = 0;
      timeEntries.forEach(entry => {
        if (entry.duration) {
          totalDuration += entry.duration;
        }
      });

      // Group by project/task
      const projectBreakdown: any = {};
      const taskBreakdown: any = {};

      for (const entry of timeEntries) {
        // Project breakdown
        if (entry.task && entry.task.projectId) {
          if (!projectBreakdown[entry.task.projectId]) {
            const project = await this.projectRepository.findOne({
              where: { id: entry.task.projectId }
            });
            
            projectBreakdown[entry.task.projectId] = {
              projectName: project?.name || 'Unknown Project',
              duration: 0,
              entries: []
            };
          }
          
          projectBreakdown[entry.task.projectId].duration += entry.duration || 0;
          projectBreakdown[entry.task.projectId].entries.push(entry);
        }

        // Task breakdown
        if (entry.taskId) {
          if (!taskBreakdown[entry.taskId]) {
            const task = await this.taskRepository.findOne({
              where: { id: entry.taskId }
            });
            
            taskBreakdown[entry.taskId] = {
              taskTitle: task?.title || 'Unknown Task',
              duration: 0,
              entries: []
            };
          }
          
          taskBreakdown[entry.taskId].duration += entry.duration || 0;
          taskBreakdown[entry.taskId].entries.push(entry);
        }
      }

      // Calculate total cost if billable rates are provided
      let totalCost = 0;
      timeEntries.forEach(entry => {
        if (entry.billableRate && entry.duration) {
          // Convert duration from seconds to hours and multiply by rate
          const hours = entry.duration / 3600;
          totalCost += hours * entry.billableRate;
        }
      });

      return {
        startDate,
        endDate,
        totalDuration, // in seconds
        totalDurationHours: totalDuration / 3600, // in hours
        totalCost: parseFloat(totalCost.toFixed(2)),
        projectBreakdown: Object.values(projectBreakdown),
        taskBreakdown: Object.values(taskBreakdown),
        timeEntries
      };
    } catch (error) {
      this.logger.error(`Error generating time report for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to generate time report: ${error.message}`);
    }
  }

  /**
   * Export time report in specified format
   */
  async exportTimeReport(
    userId: string,
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'csv' | 'excel',
    projectId?: string,
    taskId?: string,
    billableRate?: number,
  ): Promise<any> {
    try {
      const report = await this.generateTimeReport(userId, startDate, endDate, projectId, taskId);
      
      // Apply billable rate if provided and not already set on entries
      if (billableRate) {
        report.timeEntries.forEach((entry: TimeEntry) => {
          if (!entry.billableRate) {
            entry.billableRate = billableRate;
          }
        });
        
        // Recalculate total cost
        let totalCost = 0;
        report.timeEntries.forEach((entry: TimeEntry) => {
          if (entry.billableRate && entry.duration) {
            const hours = entry.duration / 3600;
            totalCost += hours * entry.billableRate;
          }
        });
        report.totalCost = parseFloat(totalCost.toFixed(2));
      }

      // In a real implementation, this would generate actual files
      // For now, we'll return metadata about the export
      return {
        exportId: `export_${Date.now()}`,
        status: 'completed',
        format,
        downloadUrl: `/exports/time-report-${Date.now()}.${format}`,
        reportData: report
      };
    } catch (error) {
      this.logger.error(`Error exporting time report for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to export time report: ${error.message}`);
    }
  }
}