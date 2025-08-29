import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitService],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isRateLimited', () => {
    it('should allow requests under the limit', async () => {
      const result = await service.isRateLimited('test-key-1', 5, 60);
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(4);
    });

    it('should block requests over the limit', async () => {
      // Make 6 requests to exceed the limit of 5
      for (let i = 0; i < 6; i++) {
        await service.isRateLimited('test-key-2', 5, 60);
      }
      
      const result = await service.isRateLimited('test-key-2', 5, 60);
      expect(result.isLimited).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });

  describe('clearRateLimit', () => {
    it('should clear existing rate limit', async () => {
      // Set up a rate limit
      await service.isRateLimited('test-key-3', 5, 60);
      
      // Clear it
      await service.clearRateLimit('test-key-3');
      
      // Check that it's cleared
      const result = await service.isRateLimited('test-key-3', 5, 60);
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(4);
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return null for non-existent rate limit', async () => {
      const result = await service.getRateLimitInfo('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return info for existing rate limit', async () => {
      await service.isRateLimited('test-key-4', 5, 60);
      
      const result = await service.getRateLimitInfo('test-key-4');
      expect(result).not.toBeNull();
      expect(result!.count).toBe(1);
    });
  });
});