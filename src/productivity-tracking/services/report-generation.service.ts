import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportTemplate } from '../entities/report-template.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Project } from '../../projects/entities/project.entity';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class ReportGenerationService {
  private readonly logger = new Logger(ReportGenerationService.name);

  constructor(
    @InjectRepository(ReportTemplate)
    private readonly reportTemplateRepository: Repository<ReportTemplate>,
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  /**
   * Create a new report template
   */
  async createReportTemplate(templateData: Partial<ReportTemplate>): Promise<ReportTemplate> {
    try {
      const template = this.reportTemplateRepository.create(templateData);
      return await this.reportTemplateRepository.save(template);
    } catch (error) {
      this.logger.error(`Error creating report template: ${error.message}`);
      throw new ProductivityException(`Failed to create report template: ${error.message}`);
    }
  }

  /**
   * Get user's report templates
   */
  async getUserReportTemplates(userId: string): Promise<ReportTemplate[]> {
    try {
      return await this.reportTemplateRepository.find({
        where: { userId, isActive: true }
      });
    } catch (error) {
      this.logger.error(`Error retrieving report templates for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve report templates: ${error.message}`);
    }
  }

  /**
   * Generate a report based on template and parameters
   */
  async generateReport(
    userId: string,
    templateId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const template = await this.reportTemplateRepository.findOne({
        where: { id: templateId, userId }
      });

      if (!template) {
        throw new ProductivityException('Report template not found');
      }

      // Parse template configuration
      const config = template.configuration;

      // Build the report based on template configuration
      const report: any = {
        templateName: template.name,
        generatedAt: new Date(),
        period: { startDate, endDate }
      };

      // Include time tracking data if specified in template
      if (config.includeTimeTracking) {
        report.timeTracking = await this.getTimeTrackingData(userId, startDate, endDate, config);
      }

      // Include task completion data if specified in template
      if (config.includeTaskCompletion) {
        report.taskCompletion = await this.getTaskCompletionData(userId, startDate, endDate, config);
      }

      // Include project data if specified in template
      if (config.includeProjects) {
        report.projects = await this.getProjectData(userId, startDate, endDate, config);
      }

      return report;
    } catch (error) {
      this.logger.error(`Error generating report from template ${templateId}: ${error.message}`);
      throw new ProductivityException(`Failed to generate report: ${error.message}`);
    }
  }

  /**
   * Get time tracking data for report
   */
  private async getTimeTrackingData(
    userId: string,
    startDate: Date,
    endDate: Date,
    config: any
  ): Promise<any> {
    let query = this.timeEntryRepository.createQueryBuilder('timeEntry')
      .where('timeEntry.userId = :userId', { userId })
      .andWhere('timeEntry.startTime >= :startDate', { startDate })
      .andWhere('timeEntry.startTime <= :endDate', { endDate });

    if (config.filterByProject) {
      query = query.leftJoinAndSelect('timeEntry.task', 'task')
        .andWhere('task.projectId = :projectId', { projectId: config.projectId });
    }

    const timeEntries = await query.getMany();

    // Calculate statistics
    const totalDuration = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    
    // Group by date if specified
    const dailyBreakdown: any = {};
    if (config.groupByDate) {
      timeEntries.forEach(entry => {
        const date = entry.startTime.toISOString().split('T')[0];
        if (!dailyBreakdown[date]) {
          dailyBreakdown[date] = 0;
        }
        dailyBreakdown[date] += entry.duration || 0;
      });
    }

    return {
      totalEntries: timeEntries.length,
      totalDuration, // in seconds
      totalDurationHours: totalDuration / 3600, // in hours
      dailyBreakdown: config.groupByDate ? dailyBreakdown : undefined
    };
  }

  /**
   * Get task completion data for report
   */
  private async getTaskCompletionData(
    userId: string,
    startDate: Date,
    endDate: Date,
    config: any
  ): Promise<any> {
    let query = this.taskRepository.createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.updatedAt >= :startDate', { startDate })
      .andWhere('task.updatedAt <= :endDate', { endDate });

    if (config.filterByProject) {
      query = query.andWhere('task.projectId = :projectId', { projectId: config.projectId });
    }

    const tasks = await query.getMany();
    const completedTasks = tasks.filter(task => task.completed);

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
    };
  }

  /**
   * Get project data for report
   */
  private async getProjectData(
    userId: string,
    startDate: Date,
    endDate: Date,
    config: any
  ): Promise<any> {
    // Get projects associated with user's tasks in the time period
    const projectIds = await this.taskRepository.createQueryBuilder('task')
      .select('DISTINCT task.projectId')
      .where('task.userId = :userId', { userId })
      .andWhere('task.updatedAt >= :startDate', { startDate })
      .andWhere('task.updatedAt <= :endDate', { endDate })
      .getRawMany();

    if (projectIds.length === 0) {
      return [];
    }

    const ids = projectIds.map(p => p.projectId).filter(id => id !== null);
    
    if (ids.length === 0) {
      return [];
    }

    const projects = await this.projectRepository.findByIds(ids);
    
    // Get task completion stats for each project
    const projectStats: any[] = [];
    for (const project of projects) {
      const taskStats = await this.getTaskCompletionData(userId, startDate, endDate, {
        ...config,
        filterByProject: true,
        projectId: project.id
      });
      
      projectStats.push({
        project: {
          id: project.id,
          name: project.name
        },
        stats: taskStats
      });
    }

    return projectStats;
  }

  /**
   * Delete a report template
   */
  async deleteReportTemplate(templateId: string, userId: string): Promise<void> {
    try {
      const template = await this.reportTemplateRepository.findOne({
        where: { id: templateId, userId }
      });

      if (!template) {
        throw new ProductivityException('Report template not found');
      }

      await this.reportTemplateRepository.remove(template);
    } catch (error) {
      this.logger.error(`Error deleting report template ${templateId}: ${error.message}`);
      throw new ProductivityException(`Failed to delete report template: ${error.message}`);
    }
  }
}