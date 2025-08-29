import { Injectable, Logger } from '@nestjs/common';
import { TimeBlock } from '../entities/time-block.entity';
import { CalendarTimeBlockDto } from '../dto/calendar-time-block.dto';
import { CalendarViewType } from '../dto/calendar-view.dto';

@Injectable()
export class MobileOptimizationService {
  private readonly logger = new Logger(MobileOptimizationService.name);

  /**
   * Optimize time blocks for mobile devices by reducing data size
   * @param timeBlocks The time blocks to optimize
   * @param isMobile Whether the request is from a mobile device
   * @returns Optimized time blocks
   */
  optimizeForMobile(
    timeBlocks: TimeBlock[],
    isMobile: boolean = false
  ): CalendarTimeBlockDto[] {
    if (!isMobile) {
      // For non-mobile devices, return full data
      return timeBlocks.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
    }
    
    // For mobile devices, reduce data size
    return timeBlocks.map(tb => this.createMobileOptimizedTimeBlock(tb));
  }

  /**
   * Create a mobile-optimized time block with reduced data
   * @param timeBlock The original time block
   * @returns Mobile-optimized time block
   */
  private createMobileOptimizedTimeBlock(timeBlock: TimeBlock): CalendarTimeBlockDto {
    return {
      id: timeBlock.id,
      title: timeBlock.title,
      description: timeBlock.description || '',
      startTime: timeBlock.startTime,
      endTime: timeBlock.endTime,
      color: timeBlock.color,
      taskId: timeBlock.taskId,
      taskTitle: timeBlock.task ? timeBlock.task.title : ''
      // Omit other non-essential fields for mobile
    };
  }

  /**
   * Reduce data resolution for mobile devices
   * @param timeBlocks The time blocks to reduce
   * @param view The current view type
   * @param isMobile Whether the request is from a mobile device
   * @returns Reduced time blocks
   */
  reduceDataResolution(
    timeBlocks: TimeBlock[],
    view: CalendarViewType,
    isMobile: boolean = false
  ): CalendarTimeBlockDto[] {
    if (!isMobile) {
      // For non-mobile devices, return full data
      return timeBlocks.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
    }
    
    // For mobile devices, reduce data based on view type
    switch (view) {
      case CalendarViewType.MONTH:
        // For month view on mobile, aggregate events by day
        return this.aggregateByDayForMobile(timeBlocks);
      case CalendarViewType.WEEK:
        // For week view on mobile, limit to essential data
        return timeBlocks.slice(0, 50).map(tb => this.createMobileOptimizedTimeBlock(tb));
      case CalendarViewType.DAY:
        // For day view on mobile, return full data but limit count
        return timeBlocks.slice(0, 100).map(tb => this.createMobileOptimizedTimeBlock(tb));
      default:
        return timeBlocks.slice(0, 50).map(tb => this.createMobileOptimizedTimeBlock(tb));
    }
  }

  /**
   * Aggregate time blocks by day for mobile month view
   * @param timeBlocks The time blocks to aggregate
   * @returns Aggregated time blocks
   */
  private aggregateByDayForMobile(timeBlocks: TimeBlock[]): CalendarTimeBlockDto[] {
    const aggregatedByDay = new Map<string, TimeBlock[]>();
    
    // Group time blocks by day
    for (const timeBlock of timeBlocks) {
      const dateKey = timeBlock.startTime.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!aggregatedByDay.has(dateKey)) {
        aggregatedByDay.set(dateKey, []);
      }
      const dayBlocks = aggregatedByDay.get(dateKey);
      if (dayBlocks) {
        dayBlocks.push(timeBlock);
      }
    }
    
    // Create simplified time blocks for each day
    const simplifiedTimeBlocks: CalendarTimeBlockDto[] = [];
    for (const [dateKey, dayTimeBlocks] of aggregatedByDay.entries()) {
      if (dayTimeBlocks.length > 0) {
        const simplifiedTimeBlock: CalendarTimeBlockDto = {
          id: `mobile-aggregated-${dateKey}`,
          title: `${dayTimeBlocks.length} event${dayTimeBlocks.length > 1 ? 's' : ''}`,
          description: '',
          startTime: new Date(dateKey),
          endTime: new Date(dateKey),
          color: dayTimeBlocks[0].color || '#007bff',
          taskId: dayTimeBlocks[0].taskId || '',
          taskTitle: dayTimeBlocks[0].task ? dayTimeBlocks[0].task.title : ''
        };
        simplifiedTimeBlocks.push(simplifiedTimeBlock);
      }
    }
    
    return simplifiedTimeBlocks;
  }

  /**
   * Optimize for low-memory devices
   * @param timeBlocks The time blocks to optimize
   * @param maxItems Maximum number of items to return
   * @returns Optimized time blocks
   */
  optimizeForLowMemory(
    timeBlocks: TimeBlock[],
    maxItems: number = 50
  ): CalendarTimeBlockDto[] {
    // Limit the number of items
    const limitedTimeBlocks = timeBlocks.slice(0, maxItems);
    
    // Return minimal data structure
    return limitedTimeBlocks.map(tb => ({
      id: tb.id,
      title: tb.title,
      description: tb.description || '',
      startTime: tb.startTime,
      endTime: tb.endTime,
      color: tb.color,
      taskId: tb.taskId,
      taskTitle: tb.task ? tb.task.title : ''
    }));
  }

  /**
   * Compress time block data for efficient transmission
   * @param timeBlocks The time blocks to compress
   * @returns Compressed time blocks as a string
   */
  compressTimeBlocks(timeBlocks: CalendarTimeBlockDto[]): string {
    try {
      // Convert to JSON and compress (simplified compression)
      const jsonString = JSON.stringify(timeBlocks);
      
      // In a real implementation, we would use a proper compression library
      // For now, we'll just return the JSON string
      return jsonString;
    } catch (error) {
      this.logger.error('Error compressing time blocks', error.stack);
      // Return uncompressed data in case of error
      return JSON.stringify(timeBlocks);
    }
  }

  /**
   * Decompress time block data
   * @param compressedData The compressed data
   * @returns Decompressed time blocks
   */
  decompressTimeBlocks(compressedData: string): CalendarTimeBlockDto[] {
    try {
      // In a real implementation, we would decompress the data
      // For now, we'll just parse the JSON
      return JSON.parse(compressedData);
    } catch (error) {
      this.logger.error('Error decompressing time blocks', error.stack);
      return [];
    }
  }
}