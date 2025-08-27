import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RateLimitService {
  private redisClient: any;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    this.redisClient.connect().catch(console.error);
  }

  async isRateLimited(
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ isLimited: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const resetTime = now + windowSeconds;

    try {
      const current = await this.redisClient.get(key);

      if (current === null) {
        // First request in window
        await this.redisClient.set(key, '1', { EX: windowSeconds });
        return { isLimited: false, remaining: limit - 1, resetTime };
      }

      const count = parseInt(current, 10);

      if (count >= limit) {
        // Rate limit exceeded
        const ttl = await this.redisClient.ttl(key);
        return { isLimited: true, remaining: 0, resetTime: now + ttl };
      }

      // Increment counter
      await this.redisClient.incr(key);
      const remaining = limit - count - 1;

      return { isLimited: false, remaining, resetTime };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If Redis is down, we don't want to block legitimate requests
      return { isLimited: false, remaining: limit, resetTime };
    }
  }

  async clearRateLimit(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`;
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error('Error clearing rate limit:', error);
    }
  }

  async getRateLimitInfo(identifier: string): Promise<{ count: number; resetTime: number } | null> {
    const key = `rate_limit:${identifier}`;
    try {
      const current = await this.redisClient.get(key);
      if (current === null) {
        return null;
      }

      const count = parseInt(current, 10);
      const ttl = await this.redisClient.ttl(key);
      const resetTime = Math.floor(Date.now() / 1000) + ttl;

      return { count, resetTime };
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      return null;
    }
  }
}