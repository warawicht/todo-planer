import { Injectable } from '@nestjs/common';
import { TimeBlock } from '../entities/time-block.entity';
import { CalendarTimeBlockDto, CalendarTimeBlockPosition } from '../dto/calendar-time-block.dto';
import { CalendarViewType } from '../dto/calendar-view.dto';

@Injectable()
export class CalendarDataAggregatorService {
  /**
   * Aggregate time blocks for a specific calendar view
   * @param timeBlocks The time blocks to aggregate
   * @param view The calendar view type
   * @param startDate The start date of the view
   * @param endDate The end date of the view
   * @returns Aggregated calendar time blocks with view-specific positioning
   */
  aggregateTimeBlocks(
    timeBlocks: TimeBlock[],
    view: CalendarViewType,
    startDate: Date,
    endDate: Date
  ): CalendarTimeBlockDto[] {
    switch (view) {
      case CalendarViewType.DAY:
        return this.aggregateForDayView(timeBlocks, startDate);
      case CalendarViewType.WEEK:
        return this.aggregateForWeekView(timeBlocks, startDate);
      case CalendarViewType.MONTH:
        return this.aggregateForMonthView(timeBlocks, startDate, endDate);
      default:
        throw new Error(`Unsupported view type: ${view}`);
    }
  }

  /**
   * Aggregate time blocks for day view with positioning
   * @param timeBlocks The time blocks to aggregate
   * @param referenceDate The reference date for the day view
   * @returns Aggregated calendar time blocks with day view positioning
   */
  private aggregateForDayView(timeBlocks: TimeBlock[], referenceDate: Date): CalendarTimeBlockDto[] {
    // Filter time blocks for the specific day
    const dayStart = new Date(referenceDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(referenceDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayTimeBlocks = timeBlocks.filter(tb => 
      tb.startTime <= dayEnd && tb.endTime >= dayStart
    );
    
    // Calculate positions for each time block
    return dayTimeBlocks.map(tb => {
      const calendarTimeBlock = CalendarTimeBlockDto.fromTimeBlock(tb);
      calendarTimeBlock.position = this.calculateDayViewPosition(tb, referenceDate);
      return calendarTimeBlock;
    });
  }

  /**
   * Calculate position for a time block in day view
   * @param timeBlock The time block
   * @param referenceDate The reference date
   * @returns Position object with top, left, height, and width
   */
  private calculateDayViewPosition(timeBlock: TimeBlock, referenceDate: Date): CalendarTimeBlockPosition {
    // Calculate the position based on start and end times
    // Assuming a 24-hour day display with 1440 minutes total
    const dayStart = new Date(referenceDate);
    dayStart.setHours(0, 0, 0, 0);
    
    // Calculate start minutes from day start
    const startMinutes = (timeBlock.startTime.getHours() * 60) + timeBlock.startTime.getMinutes();
    const endMinutes = (timeBlock.endTime.getHours() * 60) + timeBlock.endTime.getMinutes();
    
    // Handle overnight time blocks
    const displayStartMinutes = Math.max(startMinutes, 0);
    const displayEndMinutes = Math.min(endMinutes, 1439); // 23:59 in minutes
    
    // Calculate position (assuming 24-hour display height of 1000px)
    const top = (displayStartMinutes / 1440) * 1000;
    const height = ((displayEndMinutes - displayStartMinutes) / 1440) * 1000;
    
    return {
      top,
      left: 0, // Day view is single column
      height,
      width: 100, // Full width
    };
  }

  /**
   * Aggregate time blocks for week view with positioning
   * @param timeBlocks The time blocks to aggregate
   * @param weekStartDate The start date of the week
   * @returns Aggregated calendar time blocks with week view positioning
   */
  private aggregateForWeekView(timeBlocks: TimeBlock[], weekStartDate: Date): CalendarTimeBlockDto[] {
    // Calculate week start and end dates
    const startDate = new Date(weekStartDate);
    startDate.setDate(weekStartDate.getDate() - weekStartDate.getDay()); // Sunday
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Saturday
    endDate.setHours(23, 59, 59, 999);
    
    // Filter time blocks for the week
    const weekTimeBlocks = timeBlocks.filter(tb => 
      tb.startTime <= endDate && tb.endTime >= startDate
    );
    
    // Calculate positions for each time block
    return weekTimeBlocks.map(tb => {
      const calendarTimeBlock = CalendarTimeBlockDto.fromTimeBlock(tb);
      calendarTimeBlock.position = this.calculateWeekViewPosition(tb, startDate);
      return calendarTimeBlock;
    });
  }

  /**
   * Calculate position for a time block in week view
   * @param timeBlock The time block
   * @param weekStartDate The start date of the week
   * @returns Position object with top, left, height, and width
   */
  private calculateWeekViewPosition(timeBlock: TimeBlock, weekStartDate: Date): CalendarTimeBlockPosition {
    // Calculate which day of the week the time block starts
    const dayOfWeek = timeBlock.startTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the position based on start and end times
    const startMinutes = (timeBlock.startTime.getHours() * 60) + timeBlock.startTime.getMinutes();
    const endMinutes = (timeBlock.endTime.getHours() * 60) + timeBlock.endTime.getMinutes();
    
    // Calculate position (assuming 24-hour display height of 1000px)
    const top = (startMinutes / 1440) * 1000;
    const height = ((endMinutes - startMinutes) / 1440) * 1000;
    
    // Calculate left position based on day of week (assuming 7 columns, each 14.28% wide)
    const left = dayOfWeek * 14.28;
    const width = 14.28; // One day column width
    
    return {
      top,
      left,
      height,
      width,
    };
  }

  /**
   * Aggregate time blocks for month view with display dates
   * @param timeBlocks The time blocks to aggregate
   * @param startDate The start date of the month view
   * @param endDate The end date of the month view
   * @returns Aggregated calendar time blocks with month view display dates
   */
  private aggregateForMonthView(timeBlocks: TimeBlock[], startDate: Date, endDate: Date): CalendarTimeBlockDto[] {
    // Filter time blocks for the month range
    const monthTimeBlocks = timeBlocks.filter(tb => 
      tb.startTime <= endDate && tb.endTime >= startDate
    );
    
    // Add display date for each time block
    return monthTimeBlocks.map(tb => {
      const calendarTimeBlock = CalendarTimeBlockDto.fromTimeBlock(tb);
      // Use the date part of startTime for display in month view
      calendarTimeBlock.displayDate = tb.startTime.toISOString().split('T')[0];
      return calendarTimeBlock;
    });
  }
}