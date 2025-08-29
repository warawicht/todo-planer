import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardWidget } from '../entities/dashboard-widget.entity';
import { DashboardConfigDto } from '../dto/dashboard-config.dto';
import { StatisticsService } from './statistics.service';
import { TimeTrackingService } from './time-tracking.service';
import { TrendAnalysisService } from './trend-analysis.service';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(DashboardWidget)
    private readonly dashboardWidgetRepository: Repository<DashboardWidget>,
    private readonly statisticsService: StatisticsService,
    private readonly timeTrackingService: TimeTrackingService,
    private readonly trendAnalysisService: TrendAnalysisService,
  ) {}

  /**
   * Get user's dashboard configuration and data
   */
  async getUserDashboard(userId: string): Promise<any> {
    try {
      // Get dashboard widgets
      const widgets = await this.dashboardWidgetRepository.find({
        where: { userId, isVisible: true },
        order: { position: 'ASC' },
      });

      // Aggregate data for each widget
      const widgetsWithData: any[] = [];
      for (const widget of widgets) {
        const data = await this.aggregateWidgetData(widget.widgetType, userId, widget.config);
        widgetsWithData.push({
          ...widget,
          data,
        });
      }

      return {
        widgets: widgetsWithData,
      };
    } catch (error) {
      this.logger.error(`Error retrieving dashboard for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve dashboard: ${error.message}`);
    }
  }

  /**
   * Add a new widget to user's dashboard
   */
  async addWidget(userId: string, widgetConfig: DashboardConfigDto): Promise<DashboardWidget> {
    try {
      // Get the highest position value for existing widgets
      const maxPositionResult = await this.dashboardWidgetRepository
        .createQueryBuilder('widget')
        .select('MAX(widget.position)', 'max')
        .where('widget.userId = :userId', { userId })
        .getRawOne();

      const maxPosition = maxPositionResult?.max ? parseInt(maxPositionResult.max, 10) : 0;

      // Create new widget
      const widget = this.dashboardWidgetRepository.create({
        ...widgetConfig,
        userId,
        position: maxPosition + 1,
        isVisible: widgetConfig.isVisible !== undefined ? widgetConfig.isVisible : true,
      });

      return await this.dashboardWidgetRepository.save(widget);
    } catch (error) {
      this.logger.error(`Error adding widget for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to add widget: ${error.message}`);
    }
  }

  /**
   * Update widget configuration
   */
  async updateWidget(widgetId: string, userId: string, config: Partial<DashboardConfigDto>): Promise<DashboardWidget> {
    try {
      // Find the widget
      const widget = await this.dashboardWidgetRepository.findOne({
        where: { id: widgetId, userId },
      });

      if (!widget) {
        throw new ProductivityException('Widget not found or does not belong to user');
      }

      // Update fields
      Object.assign(widget, config);

      return await this.dashboardWidgetRepository.save(widget);
    } catch (error) {
      this.logger.error(`Error updating widget ${widgetId}: ${error.message}`);
      throw new ProductivityException(`Failed to update widget: ${error.message}`);
    }
  }

  /**
   * Remove a widget from user's dashboard
   */
  async removeWidget(widgetId: string, userId: string): Promise<void> {
    try {
      // Find the widget
      const widget = await this.dashboardWidgetRepository.findOne({
        where: { id: widgetId, userId },
      });

      if (!widget) {
        throw new ProductivityException('Widget not found or does not belong to user');
      }

      await this.dashboardWidgetRepository.remove(widget);
    } catch (error) {
      this.logger.error(`Error removing widget ${widgetId}: ${error.message}`);
      throw new ProductivityException(`Failed to remove widget: ${error.message}`);
    }
  }

  /**
   * Aggregate data for a specific widget
   */
  async aggregateWidgetData(widgetType: string, userId: string, config: any): Promise<any> {
    try {
      switch (widgetType) {
        case 'completion-chart':
          // Get statistics for the configured period
          const period = config?.period || 'weekly';
          const today = new Date();
          
          let stats;
          switch (period) {
            case 'daily':
              stats = [await this.statisticsService.calculateDailyStatistics(userId, today)];
              break;
            case 'weekly':
              stats = await this.statisticsService.calculateWeeklyStatistics(userId, today);
              break;
            case 'monthly':
              stats = await this.statisticsService.calculateMonthlyStatistics(userId, today);
              break;
            default:
              stats = [await this.statisticsService.calculateDailyStatistics(userId, today)];
          }
          
          return {
            period,
            data: stats.map(stat => ({
              date: stat.date,
              completionRate: stat.completionRate,
              tasksCompleted: stat.tasksCompleted,
              tasksCreated: stat.tasksCreated,
            })),
          };

        case 'time-tracking-chart':
          // Get time tracking data for the last 7 days
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          
          const report = await this.timeTrackingService.generateTimeReport(userId, startDate, endDate);
          return report;

        case 'trend-chart':
          // Get time tracking data for the last 7 days
          const trendEndDate = new Date();
          const trendStartDate = new Date();
          trendStartDate.setDate(trendStartDate.getDate() - 7);
          
          // Get trend data
          const trendData = await this.trendAnalysisService.getTrendDataByPeriod(
            userId,
            'weekly',
            trendStartDate,
            trendEndDate,
          );
          return trendData;

        case 'task-summary':
          // Get today's statistics
          const todayStats = await this.statisticsService.calculateDailyStatistics(userId, new Date());
          return {
            tasksCompleted: todayStats.tasksCompleted,
            tasksCreated: todayStats.tasksCreated,
            completionRate: todayStats.completionRate,
            overdueTasks: todayStats.overdueTasks,
          };

        case 'time-summary':
          // Get time tracking summary for today
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
          
          const timeReport = await this.timeTrackingService.generateTimeReport(userId, todayStart, todayEnd);
          return {
            totalTimeTracked: timeReport.totalDuration,
            totalTimeTrackedHours: timeReport.totalDurationHours,
          };

        default:
          return {};
      }
    } catch (error) {
      this.logger.error(`Error aggregating widget data for type ${widgetType}: ${error.message}`);
      throw new ProductivityException(`Failed to aggregate widget data: ${error.message}`);
    }
  }

  /**
   * Reorder widgets
   */
  async reorderWidgets(userId: string, widgetIds: string[]): Promise<DashboardWidget[]> {
    try {
      const widgets: DashboardWidget[] = [];

      for (let i = 0; i < widgetIds.length; i++) {
        const widgetId = widgetIds[i];
        
        // Find the widget
        const widget = await this.dashboardWidgetRepository.findOne({
          where: { id: widgetId, userId },
        });

        if (!widget) {
          throw new ProductivityException(`Widget ${widgetId} not found or does not belong to user`);
        }

        // Update position
        widget.position = i + 1;
        const updatedWidget = await this.dashboardWidgetRepository.save(widget);
        widgets.push(updatedWidget);
      }

      return widgets;
    } catch (error) {
      this.logger.error(`Error reordering widgets for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to reorder widgets: ${error.message}`);
    }
  }
}