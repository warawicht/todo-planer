import { Test, TestingModule } from '@nestjs/testing';
import { CalendarCacheService } from './calendar-cache.service';
import { CalendarViewType } from '../dto/calendar-view.dto';
import { CalendarViewResponseDto } from '../dto/calendar-view-response.dto';

describe('CalendarCacheService', () => {
  let service: CalendarCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarCacheService],
    }).compile();

    service = module.get<CalendarCacheService>(CalendarCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCalendarView and setCalendarView', () => {
    it('should cache and retrieve calendar view data', () => {
      const userId = 'user1';
      const view = CalendarViewType.DAY;
      const referenceDate = new Date('2023-01-01');
      const data: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01'),
        timeBlocks: [],
      };

      // Set data in cache
      service.setCalendarView(userId, view, referenceDate, data);

      // Retrieve data from cache
      const cachedData = service.getCalendarView(userId, view, referenceDate);
      
      expect(cachedData).toEqual(data);
    });

    it('should return null for non-existent cache entry', () => {
      const userId = 'user1';
      const view = CalendarViewType.DAY;
      const referenceDate = new Date('2023-01-01');

      const cachedData = service.getCalendarView(userId, view, referenceDate);
      
      expect(cachedData).toBeNull();
    });

    it('should return null for expired cache entry', () => {
      jest.useFakeTimers();
      
      const userId = 'user1';
      const view = CalendarViewType.DAY;
      const referenceDate = new Date('2023-01-01');
      const data: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01'),
        timeBlocks: [],
      };

      // Set data in cache
      service.setCalendarView(userId, view, referenceDate, data);

      // Advance time beyond TTL (5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

      // Try to retrieve expired data
      const cachedData = service.getCalendarView(userId, view, referenceDate);
      
      expect(cachedData).toBeNull();
      
      jest.useRealTimers();
    });
  });

  describe('clearUserCache', () => {
    it('should clear cache for a specific user', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const view = CalendarViewType.DAY;
      const referenceDate = new Date('2023-01-01');
      const data: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01'),
        timeBlocks: [],
      };

      // Set data in cache for both users
      service.setCalendarView(userId1, view, referenceDate, data);
      service.setCalendarView(userId2, view, referenceDate, data);

      // Verify both entries exist
      expect(service.getCalendarView(userId1, view, referenceDate)).toEqual(data);
      expect(service.getCalendarView(userId2, view, referenceDate)).toEqual(data);

      // Clear cache for user1
      service.clearUserCache(userId1);

      // Verify user1's cache is cleared but user2's cache remains
      expect(service.getCalendarView(userId1, view, referenceDate)).toBeNull();
      expect(service.getCalendarView(userId2, view, referenceDate)).toEqual(data);
    });
  });

  describe('clearAllCache', () => {
    it('should clear all cache', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const view = CalendarViewType.DAY;
      const referenceDate = new Date('2023-01-01');
      const data: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01'),
        timeBlocks: [],
      };

      // Set data in cache for both users
      service.setCalendarView(userId1, view, referenceDate, data);
      service.setCalendarView(userId2, view, referenceDate, data);

      // Verify both entries exist
      expect(service.getCalendarView(userId1, view, referenceDate)).toEqual(data);
      expect(service.getCalendarView(userId2, view, referenceDate)).toEqual(data);

      // Clear all cache
      service.clearAllCache();

      // Verify all cache is cleared
      expect(service.getCalendarView(userId1, view, referenceDate)).toBeNull();
      expect(service.getCalendarView(userId2, view, referenceDate)).toBeNull();
    });
  });
});