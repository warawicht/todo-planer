import { Injectable, Logger } from '@nestjs/common';
import { TimeBlock } from '../entities/time-block.entity';
import { CalendarViewType } from '../dto/calendar-view.dto';
import { CalendarTimeBlockDto } from '../dto/calendar-time-block.dto';

@Injectable()
export class LazyLoadingService {
  private readonly logger = new Logger(LazyLoadingService.name);

  /**
   * Load time blocks incrementally based on priority
   * @param timeBlocks All time blocks to load
   * @param viewportStartDate Start date of the current viewport
   * @param viewportEndDate End date of the current viewport
   * @param batchSize Number of items to load in each batch
   * @returns Generator function that yields batches of time blocks
   */
  *loadTimeBlocksIncrementally(
    timeBlocks: TimeBlock[],
    viewportStartDate: Date,
    viewportEndDate: Date,
    batchSize: number = 20
  ): Generator<CalendarTimeBlockDto[], void, unknown> {
    // Sort time blocks by priority - viewport items first, then chronological
    const sortedTimeBlocks = [...timeBlocks].sort((a, b) => {
      // Check if items are in viewport
      const aInViewport = a.startTime <= viewportEndDate && a.endTime >= viewportStartDate;
      const bInViewport = b.startTime <= viewportEndDate && b.endTime >= viewportStartDate;
      
      // Prioritize viewport items
      if (aInViewport && !bInViewport) return -1;
      if (!aInViewport && bInViewport) return 1;
      
      // For items in the same priority group, sort chronologically
      return a.startTime.getTime() - b.startTime.getTime();
    });
    
    // Yield batches
    for (let i = 0; i < sortedTimeBlocks.length; i += batchSize) {
      const batch = sortedTimeBlocks.slice(i, i + batchSize);
      const calendarTimeBlocks = batch.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
      yield calendarTimeBlocks;
    }
  }

  /**
   * Load time blocks with progressive enhancement based on importance
   * @param timeBlocks All time blocks to load
   * @param viewportStartDate Start date of the current viewport
   * @param viewportEndDate End date of the current viewport
   * @returns Object with primary and secondary time blocks
   */
  loadTimeBlocksWithProgressiveEnhancement(
    timeBlocks: TimeBlock[],
    viewportStartDate: Date,
    viewportEndDate: Date
  ): { 
    primaryTimeBlocks: CalendarTimeBlockDto[]; 
    secondaryTimeBlocks: CalendarTimeBlockDto[] 
  } {
    // Separate time blocks into primary (viewport) and secondary (outside viewport)
    const primaryTimeBlocks: TimeBlock[] = [];
    const secondaryTimeBlocks: TimeBlock[] = [];
    
    for (const timeBlock of timeBlocks) {
      if (timeBlock.startTime <= viewportEndDate && timeBlock.endTime >= viewportStartDate) {
        primaryTimeBlocks.push(timeBlock);
      } else {
        secondaryTimeBlocks.push(timeBlock);
      }
    }
    
    // Convert to CalendarTimeBlockDto
    const primaryCalendarTimeBlocks = primaryTimeBlocks.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
    const secondaryCalendarTimeBlocks = secondaryTimeBlocks.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
    
    this.logger.debug(`Loaded ${primaryTimeBlocks.length} primary and ${secondaryTimeBlocks.length} secondary time blocks`);
    
    return {
      primaryTimeBlocks: primaryCalendarTimeBlocks,
      secondaryTimeBlocks: secondaryCalendarTimeBlocks
    };
  }

  /**
   * Load time blocks with level of detail based on zoom level
   * @param timeBlocks All time blocks to load
   * @param view The current calendar view type
   * @param zoomLevel The current zoom level (1 = normal, < 1 = zoomed out, > 1 = zoomed in)
   * @returns Time blocks with appropriate level of detail
   */
  loadTimeBlocksWithLevelOfDetail(
    timeBlocks: TimeBlock[],
    view: CalendarViewType,
    zoomLevel: number = 1
  ): CalendarTimeBlockDto[] {
    // For zoomed out views, we might want to aggregate or simplify data
    if (zoomLevel < 0.5 && view === CalendarViewType.MONTH) {
      // For highly zoomed out month view, we might aggregate by day
      const aggregatedByDay = new Map<string, TimeBlock[]>();
      
      for (const timeBlock of timeBlocks) {
        const dateKey = timeBlock.startTime.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!aggregatedByDay.has(dateKey)) {
          aggregatedByDay.set(dateKey, []);
        }
        aggregatedByDay.get(dateKey).push(timeBlock);
      }
      
      // Create simplified time blocks for each day
      const simplifiedTimeBlocks: TimeBlock[] = [];
      for (const [dateKey, dayTimeBlocks] of aggregatedByDay.entries()) {
        if (dayTimeBlocks.length > 0) {
          const simplifiedTimeBlock = new TimeBlock();
          simplifiedTimeBlock.id = `aggregated-${dateKey}`;
          simplifiedTimeBlock.title = `${dayTimeBlocks.length} events`;
          simplifiedTimeBlock.startTime = new Date(dateKey);
          simplifiedTimeBlock.endTime = new Date(dateKey);
          simplifiedTimeBlock.description = `Aggregated view of ${dayTimeBlocks.length} events on ${dateKey}`;
          simplifiedTimeBlocks.push(simplifiedTimeBlock);
        }
      }
      
      return simplifiedTimeBlocks.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
    }
    
    // For normal or zoomed in views, return all time blocks
    return timeBlocks.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
  }
}