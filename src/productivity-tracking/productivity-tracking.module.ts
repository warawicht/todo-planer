import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductivityStatistic } from './entities/productivity-statistic.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { TrendData } from './entities/trend-data.entity';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { StatisticsService } from './services/statistics.service';
import { TimeTrackingService } from './services/time-tracking.service';
import { TrendAnalysisService } from './services/trend-analysis.service';
import { DashboardService } from './services/dashboard.service';
import { StatisticsController } from './controllers/statistics.controller';
import { TimeTrackingController } from './controllers/time-tracking.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { Task } from '../tasks/entities/task.entity';
import { TimeBlock } from '../time-blocks/entities/time-block.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductivityStatistic,
      TimeEntry,
      TrendData,
      DashboardWidget,
      Task,
      TimeBlock,
    ]),
  ],
  controllers: [
    StatisticsController,
    TimeTrackingController,
    DashboardController,
  ],
  providers: [
    StatisticsService,
    TimeTrackingService,
    TrendAnalysisService,
    DashboardService,
  ],
  exports: [
    StatisticsService,
    TimeTrackingService,
    TrendAnalysisService,
    DashboardService,
  ],
})
export class ProductivityTrackingModule {}