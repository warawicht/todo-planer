import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Not } from 'typeorm';
import { TimeBlock } from './entities/time-block.entity';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { CalendarViewType } from './dto/calendar-view.dto';
import { CalendarTimeBlockDto } from './dto/calendar-time-block.dto';
import { CalendarViewResponseDto } from './dto/calendar-view-response.dto';
import { TimeBlockConflictException } from './exceptions/time-block-conflict.exception';
import { CalendarDataAggregatorService } from './services/calendar-data-aggregator.service';
import { DateRangeCalculatorService } from './services/date-range-calculator.service';
import { CalendarCacheService } from './services/calendar-cache.service';
import { VirtualScrollingService } from './services/virtual-scrolling.service';
import { PerformanceMonitoringService } from './services/performance-monitoring.service';

@Injectable()
export class TimeBlocksService {
  constructor(
    @InjectRepository(TimeBlock)
    private timeBlocksRepository: Repository<TimeBlock>,
    private dateRangeCalculator: DateRangeCalculatorService,
    private calendarDataAggregator: CalendarDataAggregatorService,
    private calendarCacheService: CalendarCacheService,
    private virtualScrollingService: VirtualScrollingService,
    private performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  async create(userId: string, createTimeBlockDto: CreateTimeBlockDto): Promise<TimeBlock> {
    // Validate time range
    const startTime = new Date(createTimeBlockDto.startTime);
    const endTime = new Date(createTimeBlockDto.endTime);
    
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for conflicts
    const conflicts = await this.findConflictingTimeBlocks(
      userId,
      startTime,
      endTime,
    );

    if (conflicts.length > 0) {
      throw new TimeBlockConflictException(conflicts);
    }

    // Create time block
    const timeBlock = this.timeBlocksRepository.create({
      ...createTimeBlockDto,
      startTime,
      endTime,
      userId,
    });

    // Clear cache for this user since we're adding a new time block
    this.calendarCacheService.clearUserCache(userId);

    return this.timeBlocksRepository.save(timeBlock);
  }

  async findAll(userId: string, startDate?: Date, endDate?: Date): Promise<TimeBlock[]> {
    const queryBuilder = this.timeBlocksRepository.createQueryBuilder('timeBlock');
    queryBuilder.where('timeBlock.userId = :userId', { userId });

    if (startDate && endDate) {
      // Find time blocks that overlap with the given date range
      queryBuilder.andWhere('timeBlock.startTime <= :endDate', { endDate })
                   .andWhere('timeBlock.endTime >= :startDate', { startDate });
    } else if (startDate) {
      queryBuilder.andWhere('timeBlock.endTime >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('timeBlock.startTime <= :endDate', { endDate });
    }

    // Add ordering for consistent results
    queryBuilder.orderBy('timeBlock.startTime', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOne(userId: string, id: string): Promise<TimeBlock> {
    const timeBlock = await this.timeBlocksRepository.findOne({ 
      where: { id, userId } 
    });
    
    if (!timeBlock) {
      throw new NotFoundException('Time block not found');
    }
    
    return timeBlock;
  }

  async update(userId: string, id: string, updateTimeBlockDto: UpdateTimeBlockDto): Promise<TimeBlock> {
    // Verify ownership
    const existingTimeBlock = await this.findOne(userId, id);
    
    // Prepare updated time block data
    const updatedTimeBlockData: any = { ...updateTimeBlockDto };
    
    // Convert string dates to Date objects if provided
    if (updateTimeBlockDto.startTime) {
      updatedTimeBlockData.startTime = new Date(updateTimeBlockDto.startTime);
    }
    
    if (updateTimeBlockDto.endTime) {
      updatedTimeBlockData.endTime = new Date(updateTimeBlockDto.endTime);
    }
    
    // Validate time range
    const startTimeToCheck = updatedTimeBlockData.startTime || existingTimeBlock.startTime;
    const endTimeToCheck = updatedTimeBlockData.endTime || existingTimeBlock.endTime;
    
    if (startTimeToCheck >= endTimeToCheck) {
      throw new BadRequestException('End time must be after start time');
    }
    
    // Check for conflicts if time range is being updated
    if (updateTimeBlockDto.startTime || updateTimeBlockDto.endTime) {
      const conflicts = await this.findConflictingTimeBlocks(
        userId,
        startTimeToCheck,
        endTimeToCheck,
        id, // Exclude the current time block from conflict check
      );
      
      if (conflicts.length > 0) {
        throw new TimeBlockConflictException(conflicts);
      }
    }
    
    // Update the time block
    await this.timeBlocksRepository.update(id, updatedTimeBlockData);
    
    // Clear cache for this user since we're updating a time block
    this.calendarCacheService.clearUserCache(userId);
    
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    // Verify ownership
    await this.findOne(userId, id);
    
    // Delete the time block
    await this.timeBlocksRepository.delete({ id, userId });
    
    // Clear cache for this user since we're removing a time block
    this.calendarCacheService.clearUserCache(userId);
  }

  /**
   * Get time blocks for calendar view with caching
   * @param userId The user ID
   * @param view The calendar view type
   * @param referenceDate The reference date
   * @returns Calendar view response with time blocks
   */
  async getCalendarView(
    userId: string,
    view: CalendarViewType,
    referenceDate: Date
  ): Promise<CalendarViewResponseDto> {
    // Start performance measurement
    const startTime = this.performanceMonitoringService.startMeasurement(`getCalendarView-${view}`);
    
    try {
      // Try to get from cache first
      const cachedResult = this.calendarCacheService.getCalendarView(userId, view, referenceDate);
      if (cachedResult) {
        this.performanceMonitoringService.endMeasurement(`getCalendarView-${view}`, startTime);
        return cachedResult;
      }

      // Calculate date range based on view type
      const { startDate, endDate } = this.dateRangeCalculator.calculateDateRange(view, referenceDate);
      
      // Get time blocks for the date range with optimized query
      const timeBlocks = await this.findForCalendarView(userId, startDate, endDate);
      
      // For large datasets, apply virtual scrolling
      let calendarTimeBlocks: CalendarTimeBlockDto[];
      
      if (timeBlocks.length > 100) {
        // For datasets larger than 100 items, apply virtual scrolling
        const { timeBlocks: paginatedTimeBlocks } = this.virtualScrollingService.applyVirtualScrolling(
          timeBlocks,
          1, // First page
          100 // Limit to 100 items
        );
        calendarTimeBlocks = paginatedTimeBlocks;
      } else {
        // For smaller datasets, aggregate normally
        calendarTimeBlocks = this.calendarDataAggregator.aggregateTimeBlocks(
          timeBlocks,
          view,
          startDate,
          endDate
        );
      }
      
      const result: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate,
        endDate,
        timeBlocks: calendarTimeBlocks,
      };

      // Cache the result
      this.calendarCacheService.setCalendarView(userId, view, referenceDate, result);

      // End performance measurement
      this.performanceMonitoringService.endMeasurement(`getCalendarView-${view}`, startTime);
      
      // Log memory usage periodically
      if (Math.random() < 0.1) { // 10% of the time
        this.performanceMonitoringService.logMemoryUsage();
      }

      return result;
    } catch (error) {
      // End performance measurement even in case of error
      this.performanceMonitoringService.endMeasurement(`getCalendarView-${view}`, startTime);
      throw error;
    }
  }

  /**
   * Optimized method to find time blocks for calendar view
   * @param userId The user ID
   * @param startDate The start date
   * @param endDate The end date
   * @returns Time blocks for the given date range
   */
  private async findForCalendarView(userId: string, startDate: Date, endDate: Date): Promise<TimeBlock[]> {
    const queryBuilder = this.timeBlocksRepository.createQueryBuilder('timeBlock');
    queryBuilder.where('timeBlock.userId = :userId', { userId })
                .andWhere('timeBlock.startTime <= :endDate', { endDate })
                .andWhere('timeBlock.endTime >= :startDate', { startDate })
                .orderBy('timeBlock.startTime', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Find conflicting time blocks for a user within a given time range
   * @param userId The user ID
   * @param startTime The start time of the new time block
   * @param endTime The end time of the new time block
   * @param excludeId Optional ID to exclude from conflict check (for updates)
   * @returns Array of conflicting time blocks
   */
  private async findConflictingTimeBlocks(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<TimeBlock[]> {
    // Find time blocks where:
    // newStart < existingEnd AND existingStart < newEnd
    const queryBuilder = this.timeBlocksRepository.createQueryBuilder('timeBlock');
    queryBuilder.where('timeBlock.userId = :userId', { userId })
                .andWhere('timeBlock.startTime < :endTime', { endTime })
                .andWhere('timeBlock.endTime > :startTime', { startTime });

    if (excludeId) {
      queryBuilder.andWhere('timeBlock.id != :excludeId', { excludeId });
    }
    
    return await queryBuilder.getMany();
  }
}