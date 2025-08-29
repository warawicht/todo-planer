import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeBlocksController } from './time-blocks.controller';
import { TimeBlocksService } from './time-blocks.service';
import { DateRangeCalculatorService } from './services/date-range-calculator.service';
import { CalendarDataAggregatorService } from './services/calendar-data-aggregator.service';
import { CalendarCacheService } from './services/calendar-cache.service';
import { DateNavigationService } from './services/date-navigation.service';
import { VirtualScrollingService } from './services/virtual-scrolling.service';
import { NavigationDebounceService } from './services/navigation-debounce.service';
import { RequestCancellationService } from './services/request-cancellation.service';
import { PerformanceMonitoringService } from './services/performance-monitoring.service';
import { LazyLoadingService } from './services/lazy-loading.service';
import { EnhancedCacheService } from './services/enhanced-cache.service';
import { MobileOptimizationService } from './services/mobile-optimization.service';
import { TimeBlock } from './entities/time-block.entity';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeBlock]),
    forwardRef(() => TasksModule),
  ],
  controllers: [TimeBlocksController],
  providers: [
    TimeBlocksService, 
    DateRangeCalculatorService, 
    CalendarDataAggregatorService,
    CalendarCacheService,
    DateNavigationService,
    VirtualScrollingService,
    NavigationDebounceService,
    RequestCancellationService,
    PerformanceMonitoringService,
    LazyLoadingService,
    EnhancedCacheService,
    MobileOptimizationService
  ],
  exports: [
    TimeBlocksService, 
    DateRangeCalculatorService, 
    CalendarDataAggregatorService,
    CalendarCacheService,
    DateNavigationService,
    VirtualScrollingService,
    NavigationDebounceService,
    RequestCancellationService,
    PerformanceMonitoringService,
    LazyLoadingService,
    EnhancedCacheService,
    MobileOptimizationService
  ],
})
export class TimeBlocksModule {}