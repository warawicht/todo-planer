import { Test, TestingModule } from '@nestjs/testing';
import { EnhancedCacheService } from './enhanced-cache.service';
import { CalendarViewType } from '../dto/calendar-view.dto';
import { CalendarViewResponseDto } from '../dto/calendar-view-response.dto';

describe('EnhancedCacheService', () => {
  let service: EnhancedCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnhancedCacheService],
    }).compile();

    service = module.get<EnhancedCacheService>(EnhancedCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCalendarView and setCalendarView', () => {
    it('should cache and retrieve calendar view data', () => {
      const userId = 'user-id';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15');
      
      const testData: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate: new Date('2023-06-11'),
        endDate: new Date('2023-06-17'),
        timeBlocks: []
      };
      
      // Set data in cache
      service.setCalendarView(userId, view, referenceDate, testData);
      
      // Retrieve data from cache
      const cachedData = service.getCalendarView(userId, view, referenceDate);
      
      expect(cachedData).toEqual(testData);
    });

    it('should return null for expired cache entries', () => {
      const userId = 'user-id';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15');
      
      const testData: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate: new Date('2023-06-11'),
        endDate: new Date('2023-06-17'),
        timeBlocks: []
      };
      
      // Set data in cache
      service.setCalendarView(userId, view, referenceDate, testData);
      
      // Manually expire the cache entry
      const key = `${userId}:${view}:${referenceDate.toISOString().split('T')[0]}`;
      service['cacheExpiry'].set(key, Date.now() - 1000);
      
      // Try to retrieve expired data
      const cachedData = service.getCalendarView(userId, view, referenceDate);
      
      expect(cachedData).toBeNull();
    });

    it('should return null for non-existent cache entries', () => {
      const userId = 'user-id';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15');
      
      const cachedData = service.getCalendarView(userId, view, referenceDate);
      
      expect(cachedData).toBeNull();
    });
  });

  describe('determineTTL', () => {
    it('should determine appropriate TTL based on view type', () => {
      const key = 'test-key';
      
      // Test DAY view
      const dayTTL = service['determineTTL'](key, CalendarViewType.DAY);
      expect(dayTTL).toBe(service['TTL_STRATEGIES'].FREQUENT / 2); // Default for new entries
      
      // Test WEEK view
      const weekTTL = service['determineTTL'](key, CalendarViewType.WEEK);
      expect(weekTTL).toBe(service['TTL_STRATEGIES'].NORMAL / 2); // Default for new entries
      
      // Test MONTH view
      const monthTTL = service['determineTTL'](key, CalendarViewType.MONTH);
      expect(monthTTL).toBe(service['TTL_STRATEGIES'].INFREQUENT / 2); // Default for new entries
    });
  });

  describe('clearUserCache', () => {
    it('should clear cache for a specific user', () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15');
      
      const testData: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate: new Date('2023-06-11'),
        endDate: new Date('2023-06-17'),
        timeBlocks: []
      };
      
      // Set data for both users
      service.setCalendarView(userId1, view, referenceDate, testData);
      service.setCalendarView(userId2, view, referenceDate, testData);
      
      // Verify both entries exist
      expect(service.getCalendarView(userId1, view, referenceDate)).toEqual(testData);
      expect(service.getCalendarView(userId2, view, referenceDate)).toEqual(testData);
      
      // Clear cache for user 1
      service.clearUserCache(userId1);
      
      // Verify user 1 cache is cleared but user 2 cache remains
      expect(service.getCalendarView(userId1, view, referenceDate)).toBeNull();
      expect(service.getCalendarView(userId2, view, referenceDate)).toEqual(testData);
    });
  });

  describe('clearAllCache', () => {
    it('should clear all cache entries', () => {
      const userId = 'user-id';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15');
      
      const testData: CalendarViewResponseDto = {
        view,
        referenceDate,
        startDate: new Date('2023-06-11'),
        endDate: new Date('2023-06-17'),
        timeBlocks: []
      };
      
      // Set data in cache
      service.setCalendarView(userId, view, referenceDate, testData);
      
      // Verify entry exists
      expect(service.getCalendarView(userId, view, referenceDate)).toEqual(testData);
      
      // Clear all cache
      service.clearAllCache();
      
      // Verify cache is empty
      expect(service.getCalendarView(userId, view, referenceDate)).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = service.getCacheStats();
      
      expect(stats).toBeDefined();
      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(1000);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalAccesses).toBe(0);
    });
  });

  describe('preloadAdjacentViews', () => {
    it('should not throw errors when preloading adjacent views', () => {
      const userId = 'user-id';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15');
      
      expect(() => service.preloadAdjacentViews(userId, view, referenceDate)).not.toThrow();
    });
  });
});