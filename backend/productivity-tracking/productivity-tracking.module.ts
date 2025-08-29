import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductivityStatistic } from './entities/productivity-statistic.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { TrendData } from './entities/trend-data.entity';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { ReportTemplate } from './entities/report-template.entity';
import { Goal } from './entities/goal.entity';
import { Insight } from './entities/insight.entity';
import { AnalyticsExport } from './entities/analytics-export.entity';
import { StatisticsService } from './services/statistics.service';
import { TimeTrackingService } from './services/time-tracking.service';
import { TrendAnalysisService } from './services/trend-analysis.service';
import { DashboardService } from './services/dashboard.service';
import { TimeReportingService } from './services/time-reporting.service';
import { InsightsService } from './services/insights.service';
import { GoalTrackingService } from './services/goal-tracking.service';
import { ReportGenerationService } from './services/report-generation.service';
import { ExportService } from './services/export.service';
import { AnalyticsCacheService } from './services/analytics-cache.service';
import { ParseDatePipe } from './pipes/parse-date.pipe';
import { StatisticsController } from './controllers/statistics.controller';
import { TimeTrackingController } from './controllers/time-tracking.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { TimeReportingController } from './controllers/time-reporting.controller';
import { InsightsController } from './controllers/insights.controller';
import { GoalTrackingController } from './controllers/goal-tracking.controller';
import { ReportGenerationController } from './controllers/report-generation.controller';
import { ExportController } from './controllers/export.controller';
import { Task } from '../tasks/entities/task.entity';
import { TimeBlock } from '../time-blocks/entities/time-block.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductivityStatistic,
      TimeEntry,
      TrendData,
      DashboardWidget,
      ReportTemplate,
      Goal,
      Insight,
      AnalyticsExport,
      Task,
      TimeBlock,
      Project,
    ]),
  ],
  controllers: [
    StatisticsController,
    TimeTrackingController,
    DashboardController,
    TimeReportingController,
    InsightsController,
    GoalTrackingController,
    ReportGenerationController,
    ExportController,
  ],
  providers: [
    StatisticsService,
    TimeTrackingService,
    TrendAnalysisService,
    DashboardService,
    TimeReportingService,
    InsightsService,
    GoalTrackingService,
    ReportGenerationService,
    ExportService,
    AnalyticsCacheService,
    ParseDatePipe,
  ],
  exports: [
    StatisticsService,
    TimeTrackingService,
    TrendAnalysisService,
    DashboardService,
    TimeReportingService,
    InsightsService,
    GoalTrackingService,
    ReportGenerationService,
    ExportService,
    AnalyticsCacheService,
    ParseDatePipe,
  ],
})
export class ProductivityTrackingModule {}