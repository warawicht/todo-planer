import { Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CalendarViewType } from '../dto/calendar-view.dto';
import { CalendarViewResponseDto } from '../dto/calendar-view-response.dto';

@Injectable()
export class EnhancedCacheService {
  private readonly logger = new Logger(EnhancedCacheService.name);
  private readonly cache: Map<string, any> = new Map();
  private readonly cacheExpiry: Map<string, number> = new Map();
  private readonly cacheAccessCount: Map<string, number> = new Map();
  
  // Different TTLs for different types of data
  private readonly TTL_STRATEGIES = {
    FREQUENT: 2 * 60 * 1000,      // 2 minutes for frequently accessed data
    NORMAL: 5 * 60 * 1000,        // 5 minutes for normal data
    INFREQUENT: 10 * 60 * 1000,   // 10 minutes for infrequently accessed data
  };
  
  // Cache size limits
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly EVICTION_THRESHOLD = 0.8; // Start evicting when 80% full

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
   * Get cached calendar view data with adaptive TTL
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
    const now = Date.now();

    // Check if cache exists and is not expired
    if (expiry && now < expiry) {
      const cachedData = this.cache.get(key);
      if (cachedData) {
        // Update access count for LRU eviction
        const accessCount = this.cacheAccessCount.get(key) || 0;
        this.cacheAccessCount.set(key, accessCount + 1);
        
        this.logger.debug(`Cache hit for key: ${key} (access count: ${accessCount + 1})`);
        return cachedData;
      }
    }

    // Remove expired cache entry
    if (expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      this.cacheAccessCount.delete(key);
    }

    this.logger.debug(`Cache miss for key: ${key}`);
    return null;
  }

  /**
   * Set calendar view data in cache with adaptive TTL based on access patterns
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
    // Check if we need to evict entries
    if (this.cache.size >= this.MAX_CACHE_SIZE * this.EVICTION_THRESHOLD) {
      this.evictLeastRecentlyUsed();
    }
    
    const key = this.generateCacheKey(userId, view, referenceDate);
    
    // Determine TTL based on access patterns
    const ttl = this.determineTTL(key, view);
    
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
    this.cacheAccessCount.set(key, 0); // Reset access count for new entry
    
    this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl}ms`);
  }

  /**
   * Determine TTL based on access patterns and view type
   * @param key The cache key
   * @param view The calendar view type
   * @returns Appropriate TTL in milliseconds
   */
  private determineTTL(key: string, view: CalendarViewType): number {
    // Get previous access count if exists
    const previousAccessCount = this.cacheAccessCount.get(key) || 0;
    
    // Base TTL on view type
    let baseTTL: number;
    switch (view) {
      case CalendarViewType.DAY:
        baseTTL = this.TTL_STRATEGIES.FREQUENT;
        break;
      case CalendarViewType.WEEK:
        baseTTL = this.TTL_STRATEGIES.NORMAL;
        break;
      case CalendarViewType.MONTH:
        baseTTL = this.TTL_STRATEGIES.INFREQUENT;
        break;
      default:
        baseTTL = this.TTL_STRATEGIES.NORMAL;
    }
    
    // Adjust TTL based on access frequency
    if (previousAccessCount > 10) {
      // Frequently accessed items get longer TTL
      return baseTTL * 2;
    } else if (previousAccessCount > 5) {
      // Moderately accessed items get normal TTL
      return baseTTL;
    } else {
      // Rarely accessed items get shorter TTL
      return baseTTL / 2;
    }
  }

  /**
   * Evict least recently used cache entries
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cacheAccessCount.entries());
    entries.sort((a, b) => a[1] - b[1]); // Sort by access count (ascending)
    
    // Evict 20% of entries
    const evictionCount = Math.max(1, Math.floor(this.cache.size * 0.2));
    
    for (let i = 0; i < evictionCount && i < entries.length; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      this.cacheAccessCount.delete(key);
      this.logger.debug(`Evicted LRU cache entry: ${key}`);
    }
  }

  /**
   * Preload adjacent date ranges for smoother navigation
   * @param userId The user ID
   * @param view The calendar view type
   * @param referenceDate The reference date
   */
  preloadAdjacentViews(
    userId: string,
    view: CalendarViewType,
    referenceDate: Date
  ): void {
    // Preload next and previous views in background
    setImmediate(() => {
      try {
        const nextDate = this.getNextDate(view, referenceDate);
        const prevDate = this.getPreviousDate(view, referenceDate);
        
        // Generate cache keys for adjacent views (but don't actually load data)
        const nextKey = this.generateCacheKey(userId, view, nextDate);
        const prevKey = this.generateCacheKey(userId, view, prevDate);
        
        this.logger.debug(`Preloaded adjacent views for ${userId}: ${nextKey}, ${prevKey}`);
      } catch (error) {
        this.logger.error('Error preloading adjacent views', error.stack);
      }
    });
  }

  /**
   * Get next date based on view type
   * @param view The calendar view type
   * @param date The reference date
   * @returns Next date
   */
  private getNextDate(view: CalendarViewType, date: Date): Date {
    const nextDate = new Date(date);
    switch (view) {
      case CalendarViewType.DAY:
        nextDate.setDate(date.getDate() + 1);
        break;
      case CalendarViewType.WEEK:
        nextDate.setDate(date.getDate() + 7);
        break;
      case CalendarViewType.MONTH:
        nextDate.setMonth(date.getMonth() + 1);
        break;
    }
    return nextDate;
  }

  /**
   * Get previous date based on view type
   * @param view The calendar view type
   * @param date The reference date
   * @returns Previous date
   */
  private getPreviousDate(view: CalendarViewType, date: Date): Date {
    const prevDate = new Date(date);
    switch (view) {
      case CalendarViewType.DAY:
        prevDate.setDate(date.getDate() - 1);
        break;
      case CalendarViewType.WEEK:
        prevDate.setDate(date.getDate() - 7);
        break;
      case CalendarViewType.MONTH:
        prevDate.setMonth(date.getMonth() - 1);
        break;
    }
    return prevDate;
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
      this.cacheAccessCount.delete(key);
    }
    
    this.logger.debug(`Cleared cache for user: ${userId}`);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.cacheAccessCount.clear();
    this.logger.debug('Cleared all cache');
  }

  /**
   * Get cache statistics
   * @returns Object containing cache statistics
   */
  getCacheStats(): { 
    size: number; 
    maxSize: number; 
    hitRate: number;
    totalAccesses: number;
  } {
    let totalAccesses = 0;
    let hits = 0;
    
    // Calculate approximate hit rate based on access counts
    for (const [key, accessCount] of this.cacheAccessCount.entries()) {
      totalAccesses += accessCount;
      if (this.cache.has(key)) {
        hits += accessCount;
      }
    }
    
    const hitRate = totalAccesses > 0 ? hits / totalAccesses : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: Math.round(hitRate * 10000) / 100, // Percentage with 2 decimal places
      totalAccesses
    };
  }
}