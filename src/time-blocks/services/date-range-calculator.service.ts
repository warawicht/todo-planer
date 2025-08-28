import { Injectable } from '@nestjs/common';
import { CalendarViewType } from '../dto/calendar-view.dto';

@Injectable()
export class DateRangeCalculatorService {
  /**
   * Calculate the date range for a given view type and reference date
   * @param view The calendar view type (day, week, month)
   * @param referenceDate The reference date
   * @returns Object containing startDate and endDate
   */
  calculateDateRange(view: CalendarViewType, referenceDate: Date): { startDate: Date; endDate: Date } {
    const date = new Date(referenceDate);
    
    switch (view) {
      case CalendarViewType.DAY:
        return this.calculateDayRange(date);
      case CalendarViewType.WEEK:
        return this.calculateWeekRange(date);
      case CalendarViewType.MONTH:
        return this.calculateMonthRange(date);
      default:
        throw new Error(`Unsupported view type: ${view}`);
    }
  }

  /**
   * Calculate the date range for a day view
   * @param date The reference date
   * @returns Object containing startDate and endDate for the day
   */
  private calculateDayRange(date: Date): { startDate: Date; endDate: Date } {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }

  /**
   * Calculate the date range for a week view
   * @param date The reference date
   * @returns Object containing startDate and endDate for the week (Sunday to Saturday)
   */
  private calculateWeekRange(date: Date): { startDate: Date; endDate: Date } {
    const startDate = new Date(date);
    // Set to the beginning of the week (Sunday)
    startDate.setDate(date.getDate() - date.getDay());
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    // Set to the end of the week (Saturday)
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }

  /**
   * Calculate the date range for a month view
   * @param date The reference date
   * @returns Object containing startDate and endDate for the month
   */
  private calculateMonthRange(date: Date): { startDate: Date; endDate: Date } {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }
}