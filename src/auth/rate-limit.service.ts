import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitService {
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    // Clean up expired rate limits periodically
    setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      for (const [key, value] of this.rateLimits.entries()) {
        if (value.resetTime <= now) {
          this.rateLimits.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  async isRateLimited(
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ isLimited: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    
    const rateLimit = this.rateLimits.get(key);
    
    if (!rateLimit || rateLimit.resetTime <= now) {
      // First request in window or expired window
      const resetTime = now + windowSeconds;
      this.rateLimits.set(key, { count: 1, resetTime });
      return { isLimited: false, remaining: limit - 1, resetTime };
    }

    if (rateLimit.count >= limit) {
      // Rate limit exceeded
      return { isLimited: true, remaining: 0, resetTime: rateLimit.resetTime };
    }

    // Increment counter
    const newCount = rateLimit.count + 1;
    this.rateLimits.set(key, { count: newCount, resetTime: rateLimit.resetTime });
    const remaining = limit - newCount;

    return { isLimited: false, remaining, resetTime: rateLimit.resetTime };
  }

  async clearRateLimit(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`;
    this.rateLimits.delete(key);
  }

  async getRateLimitInfo(identifier: string): Promise<{ count: number; resetTime: number } | null> {
    const key = `rate_limit:${identifier}`;
    const rateLimit = this.rateLimits.get(key);
    
    if (!rateLimit) {
      return null;
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (rateLimit.resetTime <= now) {
      this.rateLimits.delete(key);
      return null;
    }
    
    return { count: rateLimit.count, resetTime: rateLimit.resetTime };
  }
}