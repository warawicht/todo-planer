import { Injectable } from '@nestjs/common';
import { CalendarViewType } from '../dto/calendar-view.dto';

@Injectable()
export class DateNavigationService {
  /**
   * Navigate to the next date range based on the current view
   * @param currentDate The current reference date
   * @param view The current calendar view type
   * @returns The new reference date for the next range
   */
  navigateNext(currentDate: Date, view: CalendarViewType): Date {
    const date = new Date(currentDate);
    
    switch (view) {
      case CalendarViewType.DAY:
        return this.navigateNextDay(date);
      case CalendarViewType.WEEK:
        return this.navigateNextWeek(date);
      case CalendarViewType.MONTH:
        return this.navigateNextMonth(date);
      default:
        throw new Error(`Unsupported view type: ${view}`);
    }
  }

  /**
   * Navigate to the previous date range based on the current view
   * @param currentDate The current reference date
   * @param view The current calendar view type
   * @returns The new reference date for the previous range
   */
  navigatePrevious(currentDate: Date, view: CalendarViewType): Date {
    const date = new Date(currentDate);
    
    switch (view) {
      case CalendarViewType.DAY:
        return this.navigatePreviousDay(date);
      case CalendarViewType.WEEK:
        return this.navigatePreviousWeek(date);
      case CalendarViewType.MONTH:
        return this.navigatePreviousMonth(date);
      default:
        throw new Error(`Unsupported view type: ${view}`);
    }
  }

  /**
   * Navigate to today's date
   * @returns Today's date
   */
  navigateToToday(): Date {
    return new Date();
  }

  /**
   * Navigate to a specific date
   * @param targetDate The target date to navigate to
   * @returns The target date
   */
  navigateToDate(targetDate: Date): Date {
    return new Date(targetDate);
  }

  private navigateNextDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay;
  }

  private navigatePreviousDay(date: Date): Date {
    const previousDay = new Date(date);
    previousDay.setDate(date.getDate() - 1);
    return previousDay;
  }

  private navigateNextWeek(date: Date): Date {
    const nextWeek = new Date(date);
    nextWeek.setDate(date.getDate() + 7);
    return nextWeek;
  }

  private navigatePreviousWeek(date: Date): Date {
    const previousWeek = new Date(date);
    previousWeek.setDate(date.getDate() - 7);
    return previousWeek;
  }

  private navigateNextMonth(date: Date): Date {
    const nextMonth = new Date(date);
    nextMonth.setMonth(date.getMonth() + 1);
    return nextMonth;
  }

  private navigatePreviousMonth(date: Date): Date {
    const previousMonth = new Date(date);
    previousMonth.setMonth(date.getMonth() - 1);
    return previousMonth;
  }
}