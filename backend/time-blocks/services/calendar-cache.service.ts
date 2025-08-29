import { Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CalendarViewType } from '../dto/calendar-view.dto';
import { CalendarViewResponseDto } from '../dto/calendar-view-response.dto';

@Injectable()
export class CalendarCacheService {
  private readonly logger = new Logger(CalendarCacheService.name);
  private readonly cache: Map<string, CalendarViewResponseDto> = new Map();
  private readonly cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Generate a cache key for a calendar view
   * @param userId The user ID
   * @param view The calendar view type
   * @param referenceDate The reference date
   * @returns A unique cache key
   */
  private generateCacheKey(userId: string, view: CalendarViewType, referenceDate: Date): string {
    return `${userId}:${view}:${referenceDate.toISOString().split('T')[0]}`;
  }

  /**
   * Get cached calendar view data
   * @param userId The user ID
   * @param view The calendar view type
   * @param referenceDate The reference date
   * @returns Cached calendar view data or null if not found or expired
   */
  getCalendarView(
    userId: string,
    view: CalendarViewType,
    referenceDate: Date
  ): CalendarViewResponseDto | null {
    const key = this.generateCacheKey(userId, view, referenceDate);
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
   * Set calendar view data in cache
   * @param userId The user ID
   * @param view The calendar view type
   * @param referenceDate The reference date
   * @param data The calendar view data to cache
   */
  setCalendarView(
    userId: string,
    view: CalendarViewType,
    referenceDate: Date,
    data: CalendarViewResponseDto
  ): void {
    const key = this.generateCacheKey(userId, view, referenceDate);
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