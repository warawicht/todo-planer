import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';
import { createClient } from 'redis';

// Mock the redis client
jest.mock('redis', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    incr: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(60),
  })),
}));

describe('RateLimitService', () => {
  let service: RateLimitService;
  let mockRedisClient: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitService],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
    mockRedisClient = (service as any).redisClient;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isRateLimited', () => {
    it('should allow requests under the limit', async () => {
      // Mock the Redis client to return null (first request)
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockRedisClient.set.mockResolvedValueOnce('OK');
      
      const result = await service.isRateLimited('test-key-1', 5, 60);
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(4);
    });

    it('should block requests over the limit', async () => {
      // Mock the Redis client to return a value that exceeds the limit
      mockRedisClient.get.mockResolvedValueOnce('6'); // 6 requests, limit is 5
      
      const result = await service.isRateLimited('test-key-2', 5, 60);
      expect(result.isLimited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should handle Redis errors gracefully', async () => {
      // Mock the Redis client to throw an error
      mockRedisClient.get.mockRejectedValueOnce(new Error('Redis error'));
      
      const result = await service.isRateLimited('test-key-3', 5, 60);
      expect(result.isLimited).toBe(false); // Should allow requests if Redis is down
      expect(result.remaining).toBe(5); // Should return the full limit
    });
  });

  describe('clearRateLimit', () => {
    it('should clear existing rate limit', async () => {
      mockRedisClient.del.mockResolvedValueOnce(1);
      
      await service.clearRateLimit('test-key-4');
      expect(mockRedisClient.del).toHaveBeenCalledWith('rate_limit:test-key-4');
    });

    it('should handle Redis errors when clearing rate limit', async () => {
      mockRedisClient.del.mockRejectedValueOnce(new Error('Redis error'));
      
      // Should not throw an error even if Redis fails
      await expect(service.clearRateLimit('test-key-5')).resolves.toBeUndefined();
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return null for non-existent rate limit', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      
      const result = await service.getRateLimitInfo('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return info for existing rate limit', async () => {
      mockRedisClient.get.mockResolvedValueOnce('3'); // 3 requests so far
      mockRedisClient.ttl.mockResolvedValueOnce(30); // 30 seconds remaining
      
      const result = await service.getRateLimitInfo('test-key-6');
      expect(result).not.toBeNull();
      expect(result.count).toBe(3);
    });

    it('should handle Redis errors when getting rate limit info', async () => {
      mockRedisClient.get.mockRejectedValueOnce(new Error('Redis error'));
      
      const result = await service.getRateLimitInfo('test-key-7');
      expect(result).toBeNull();
    });
  });
});