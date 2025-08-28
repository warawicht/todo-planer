import { CalendarService } from './calendar.service';
import { CalendarViewType } from '../types';

describe('CalendarService', () => {
  const userId = 'user-123';
  const referenceDate = new Date(2023, 5, 15); // June 15, 2023

  describe('getCalendarView', () => {
    it('returns correct data for day view', async () => {
      const query = {
        view: CalendarViewType.DAY,
        referenceDate,
        userId
      };
      
      const result = await CalendarService.getCalendarView(query);
      
      expect(result.view).toBe(CalendarViewType.DAY);
      expect(result.referenceDate).toBe(referenceDate);
      expect(result.startDate).toEqual(referenceDate);
      expect(result.endDate).toEqual(referenceDate);
    });

    it('returns correct data for week view', async () => {
      const query = {
        view: CalendarViewType.WEEK,
        referenceDate,
        userId
      };
      
      const result = await CalendarService.getCalendarView(query);
      
      expect(result.view).toBe(CalendarViewType.WEEK);
      expect(result.referenceDate).toBe(referenceDate);
      expect(result.startDate).toEqual(new Date(2023, 5, 11)); // Sunday
      expect(result.endDate).toEqual(new Date(2023, 5, 17)); // Saturday
    });

    it('returns correct data for month view', async () => {
      const query = {
        view: CalendarViewType.MONTH,
        referenceDate,
        userId
      };
      
      const result = await CalendarService.getCalendarView(query);
      
      expect(result.view).toBe(CalendarViewType.MONTH);
      expect(result.referenceDate).toBe(referenceDate);
      expect(result.startDate).toEqual(new Date(2023, 5, 1)); // First day of June
      expect(result.endDate).toEqual(new Date(2023, 5, 30)); // Last day of June
    });
  });

  describe('getViewPreference', () => {
    it('returns user preference', async () => {
      const result = await CalendarService.getViewPreference(userId);
      
      expect(result.userId).toBe(userId);
      expect(result.defaultView).toBe(CalendarViewType.WEEK);
    });
  });

  describe('updateViewPreference', () => {
    it('updates user preference', async () => {
      const preference = {
        defaultView: CalendarViewType.MONTH
      };
      
      const result = await CalendarService.updateViewPreference(userId, preference);
      
      expect(result.userId).toBe(userId);
      expect(result.defaultView).toBe(CalendarViewType.MONTH);
    });
  });
});