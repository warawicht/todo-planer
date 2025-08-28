import {
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getDaysInMonth,
  getWeeksInMonth,
  formatTime,
  formatDate,
  isSameDay,
  addDays,
  addWeeks,
  addMonths
} from './date.utils';

describe('date.utils', () => {
  const testDate = new Date(2023, 5, 15); // June 15, 2023 (Thursday)

  describe('getStartOfWeek', () => {
    it('returns the start of the week (Sunday)', () => {
      const startOfWeek = getStartOfWeek(testDate);
      expect(startOfWeek).toEqual(new Date(2023, 5, 11)); // June 11, 2023 (Sunday)
    });
  });

  describe('getEndOfWeek', () => {
    it('returns the end of the week (Saturday)', () => {
      const endOfWeek = getEndOfWeek(testDate);
      expect(endOfWeek).toEqual(new Date(2023, 5, 17)); // June 17, 2023 (Saturday)
    });
  });

  describe('getStartOfMonth', () => {
    it('returns the first day of the month', () => {
      const startOfMonth = getStartOfMonth(testDate);
      expect(startOfMonth).toEqual(new Date(2023, 5, 1)); // June 1, 2023
    });
  });

  describe('getEndOfMonth', () => {
    it('returns the last day of the month', () => {
      const endOfMonth = getEndOfMonth(testDate);
      expect(endOfMonth).toEqual(new Date(2023, 5, 30)); // June 30, 2023
    });
  });

  describe('getDaysInMonth', () => {
    it('returns all days in a month', () => {
      const days = getDaysInMonth(2023, 5); // June (0-indexed, so 5)
      expect(days.length).toBe(30);
      expect(days[0]).toEqual(new Date(2023, 5, 1));
      expect(days[29]).toEqual(new Date(2023, 5, 30));
    });
  });

  describe('getWeeksInMonth', () => {
    it('returns all weeks in a month', () => {
      const weeks = getWeeksInMonth(2023, 5); // June
      expect(weeks.length).toBe(5); // June 2023 has 5 weeks
      expect(weeks[0].length).toBe(7); // Each week has 7 days
    });
  });

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const date = new Date(2023, 5, 15, 9, 30);
      const formatted = formatTime(date);
      expect(formatted).toMatch(/9:30/);
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date(2023, 5, 15);
      const formatted = formatDate(date);
      expect(formatted).toContain('Thu'); // Thursday
      expect(formatted).toContain('Jun'); // June
      expect(formatted).toContain('15'); // 15th
    });
  });

  describe('isSameDay', () => {
    it('returns true for the same day', () => {
      const date1 = new Date(2023, 5, 15, 10, 30);
      const date2 = new Date(2023, 5, 15, 14, 45);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns false for different days', () => {
      const date1 = new Date(2023, 5, 15);
      const date2 = new Date(2023, 5, 16);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('adds days correctly', () => {
      const result = addDays(testDate, 5);
      expect(result).toEqual(new Date(2023, 5, 20));
    });

    it('subtracts days when given negative number', () => {
      const result = addDays(testDate, -5);
      expect(result).toEqual(new Date(2023, 5, 10));
    });
  });

  describe('addWeeks', () => {
    it('adds weeks correctly', () => {
      const result = addWeeks(testDate, 2);
      expect(result).toEqual(new Date(2023, 5, 29));
    });
  });

  describe('addMonths', () => {
    it('adds months correctly', () => {
      const result = addMonths(testDate, 3);
      expect(result).toEqual(new Date(2023, 8, 15)); // September 15, 2023
    });
  });
});