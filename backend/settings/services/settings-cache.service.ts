import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SettingsCacheService {
  private readonly logger = new Logger(SettingsCacheService.name);
  private readonly cache: Map<string, any> = new Map();
  private readonly cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Generate a cache key for a setting
   * @param userId The user ID
   * @param settingType The type of setting (theme, timezone, profile)
   * @returns A unique cache key
   */
  private generateCacheKey(userId: string, settingType: string): string {
    return `${userId}:${settingType}`;
  }

  /**
   * Get cached setting data
   * @param userId The user ID
   * @param settingType The type of setting
   * @returns Cached setting data or null if not found or expired
   */
  getSetting(
    userId: string,
    settingType: string,
  ): any | null {
    const key = this.generateCacheKey(userId, settingType);
    const expiry = this.cacheExpiry.get(key);

    // Check if cache exists and is not expired
    if (expiry && Date.now() < expiry) {
      const cachedData = this.cache.get(key);
      if (cachedData) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return cachedData;
      }
    }

    // Remove expired cache entry
    if (expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    }

    this.logger.debug(`Cache miss for key: ${key}`);
    return null;
  }

  /**
   * Set setting data in cache
   * @param userId The user ID
   * @param settingType The type of setting
   * @param data The setting data to cache
   */
  setSetting(
    userId: string,
    settingType: string,
    data: any,
  ): void {
    const key = this.generateCacheKey(userId, settingType);
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
    this.logger.debug(`Cache set for key: ${key}`);
  }

  /**
   * Clear cache for a specific user
   * @param userId The user ID
   */
  clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    
    // Find all keys for this user
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    // Delete all keys for this user
    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    }
    
    this.logger.debug(`Cleared cache for user: ${userId}`);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.logger.debug('Cleared all cache');
  }
}