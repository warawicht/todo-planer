import { Injectable, Logger, ForbiddenException } from '@nestjs/common';

export interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  keyPrefix: string;
}

@Injectable()
export class RateLimitingService {
  private readonly logger = new Logger(RateLimitingService.name);
  
  // In-memory store for rate limiting (in production, this should use Redis)
  private readonly rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  // Default rate limit configurations
  private readonly defaultLimits = {
    // Per-user limits
    taskShare: { maxRequests: 10, timeWindow: 60000, keyPrefix: 'task_share' }, // 10 requests per minute
    taskAssign: { maxRequests: 10, timeWindow: 60000, keyPrefix: 'task_assign' }, // 10 requests per minute
    addComment: { maxRequests: 30, timeWindow: 60000, keyPrefix: 'add_comment' }, // 30 requests per minute
    updateComment: { maxRequests: 20, timeWindow: 60000, keyPrefix: 'update_comment' }, // 20 requests per minute
    setAvailability: { maxRequests: 15, timeWindow: 60000, keyPrefix: 'set_availability' }, // 15 requests per minute
    
    // Per-IP limits (for unauthenticated endpoints)
    unauthenticated: { maxRequests: 5, timeWindow: 60000, keyPrefix: 'unauth' }, // 5 requests per minute
  };

  /**
   * Check if a request is within rate limits
   * @param userId The user ID (or IP address for unauthenticated requests)
   * @param endpoint The endpoint being accessed
   * @returns Whether the request is allowed
   */
  async isRateLimited(userId: string, endpoint: string): Promise<boolean> {
    const config = this.getRateLimitConfig(endpoint);
    const key = `${config.keyPrefix}:${userId}`;
    
    const now = Date.now();
    const record = this.rateLimitStore.get(key);
    
    // If no record exists or the time window has passed, reset the counter
    if (!record || now >= record.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.timeWindow
      });
      return false;
    }
    
    // Increment the counter
    record.count++;
    
    // Check if the limit has been exceeded
    if (record.count > config.maxRequests) {
      this.logger.warn(`Rate limit exceeded for user ${userId} on endpoint ${endpoint}`);
      return true;
    }
    
    return false;
  }

  /**
   * Get rate limit configuration for an endpoint
   * @param endpoint The endpoint name
   * @returns The rate limit configuration
   */
  private getRateLimitConfig(endpoint: string): RateLimitConfig {
    switch (endpoint) {
      case 'taskShare':
        return this.defaultLimits.taskShare;
      case 'taskAssign':
        return this.defaultLimits.taskAssign;
      case 'addComment':
        return this.defaultLimits.addComment;
      case 'updateComment':
        return this.defaultLimits.updateComment;
      case 'setAvailability':
        return this.defaultLimits.setAvailability;
      default:
        return this.defaultLimits.unauthenticated;
    }
  }

  /**
   * Get rate limit info for a user and endpoint
   * @param userId The user ID
   * @param endpoint The endpoint name
   * @returns Rate limit information
   */
  getRateLimitInfo(userId: string, endpoint: string): { remaining: number; resetTime: number } {
    const config = this.getRateLimitConfig(endpoint);
    const key = `${config.keyPrefix}:${userId}`;
    
    const now = Date.now();
    const record = this.rateLimitStore.get(key);
    
    if (!record || now >= record.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.timeWindow
      };
    }
    
    return {
      remaining: Math.max(0, config.maxRequests - record.count),
      resetTime: record.resetTime
    };
  }

  /**
   * Reset rate limit for a user and endpoint
   * @param userId The user ID
   * @param endpoint The endpoint name
   */
  resetRateLimit(userId: string, endpoint: string): void {
    const config = this.getRateLimitConfig(endpoint);
    const key = `${config.keyPrefix}:${userId}`;
    this.rateLimitStore.delete(key);
  }

  /**
   * Clear all rate limit records (for testing purposes)
   */
  clearAllRateLimits(): void {
    this.rateLimitStore.clear();
  }
}