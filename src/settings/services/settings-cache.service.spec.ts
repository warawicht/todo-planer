import { Test, TestingModule } from '@nestjs/testing';
import { SettingsCacheService } from './settings-cache.service';

describe('SettingsCacheService', () => {
  let service: SettingsCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsCacheService],
    }).compile();

    service = module.get<SettingsCacheService>(SettingsCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSetting and setSetting', () => {
    it('should cache and retrieve setting data', () => {
      const userId = 'user-id';
      const settingType = 'theme';
      const testData = { theme: 'dark', accentColor: '#ff0000' };

      // Set data in cache
      service.setSetting(userId, settingType, testData);

      // Retrieve data from cache
      const cachedData = service.getSetting(userId, settingType);

      expect(cachedData).toEqual(testData);
    });

    it('should return null for non-existent cache entry', () => {
      const userId = 'user-id';
      const settingType = 'non-existent';

      const cachedData = service.getSetting(userId, settingType);

      expect(cachedData).toBeNull();
    });

    it('should return null for expired cache entry', () => {
      jest.useFakeTimers();

      const userId = 'user-id';
      const settingType = 'theme';
      const testData = { theme: 'light' };

      // Set data in cache
      service.setSetting(userId, settingType, testData);

      // Advance time beyond TTL (5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

      // Try to retrieve expired data
      const cachedData = service.getSetting(userId, settingType);

      expect(cachedData).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('clearUserCache', () => {
    it('should clear cache for a specific user', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const settingType = 'theme';
      const testData = { theme: 'dark' };

      // Set data in cache for both users
      service.setSetting(userId1, settingType, testData);
      service.setSetting(userId2, settingType, testData);

      // Verify both entries exist
      expect(service.getSetting(userId1, settingType)).toEqual(testData);
      expect(service.getSetting(userId2, settingType)).toEqual(testData);

      // Clear cache for user 1
      service.clearUserCache(userId1);

      // Verify user1's cache is cleared but user2's cache remains
      expect(service.getSetting(userId1, settingType)).toBeNull();
      expect(service.getSetting(userId2, settingType)).toEqual(testData);
    });
  });

  describe('clearAllCache', () => {
    it('should clear all cache entries', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const settingType = 'theme';
      const testData = { theme: 'dark' };

      // Set data in cache for both users
      service.setSetting(userId1, settingType, testData);
      service.setSetting(userId2, settingType, testData);

      // Verify both entries exist
      expect(service.getSetting(userId1, settingType)).toEqual(testData);
      expect(service.getSetting(userId2, settingType)).toEqual(testData);

      // Clear all cache
      service.clearAllCache();

      // Verify all cache is cleared
      expect(service.getSetting(userId1, settingType)).toBeNull();
      expect(service.getSetting(userId2, settingType)).toBeNull();
    });
  });
});