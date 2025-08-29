import { Test, TestingModule } from '@nestjs/testing';
import { RequestCancellationService } from './request-cancellation.service';

describe('RequestCancellationService', () => {
  let service: RequestCancellationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestCancellationService],
    }).compile();

    service = module.get<RequestCancellationService>(RequestCancellationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCancellationToken', () => {
    it('should create a cancellable token', () => {
      const userId = 'user1';
      const action = 'fetch-calendar';
      
      const token = service.createCancellationToken(userId, action);
      
      expect(token).toHaveProperty('signal');
      expect(token).toHaveProperty('cancel');
      expect(token.signal).toBeInstanceOf(AbortSignal);
      expect(typeof token.cancel).toBe('function');
    });

    it('should cancel previous request when creating new token for same user/action', () => {
      const userId = 'user1';
      const action = 'fetch-calendar';
      
      // Create first token
      const token1 = service.createCancellationToken(userId, action);
      const signal1 = token1.signal;
      
      // Create second token for same user/action
      const token2 = service.createCancellationToken(userId, action);
      const signal2 = token2.signal;
      
      // First signal should be aborted
      expect(signal1.aborted).toBe(true);
      
      // Second signal should not be aborted
      expect(signal2.aborted).toBe(false);
    });
  });

  describe('cancelRequest', () => {
    it('should cancel specific request', () => {
      const userId = 'user1';
      const action = 'fetch-calendar';
      
      // Create token
      const token = service.createCancellationToken(userId, action);
      const signal = token.signal;
      
      // Cancel the request
      service.cancelRequest(userId, action);
      
      // Signal should be aborted
      expect(signal.aborted).toBe(true);
    });

    it('should cancel all requests for a user', () => {
      const userId = 'user1';
      
      // Create tokens for different actions
      const token1 = service.createCancellationToken(userId, 'fetch-calendar');
      const token2 = service.createCancellationToken(userId, 'fetch-events');
      const signal1 = token1.signal;
      const signal2 = token2.signal;
      
      // Cancel all requests for this user
      service.cancelRequest(userId);
      
      // Both signals should be aborted
      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
    });
  });

  describe('isRequestActive', () => {
    it('should return true when request is active', () => {
      const userId = 'user1';
      const action = 'fetch-calendar';
      
      // Create token
      service.createCancellationToken(userId, action);
      
      // Request should be active
      expect(service.isRequestActive(userId, action)).toBe(true);
    });

    it('should return false when request is not active', () => {
      const userId = 'user1';
      const action = 'fetch-calendar';
      
      // Request should not be active
      expect(service.isRequestActive(userId, action)).toBe(false);
    });

    it('should check if any requests are active for a user', () => {
      const userId = 'user1';
      
      // Initially no requests active
      expect(service.isRequestActive(userId)).toBe(false);
      
      // Create a request
      service.createCancellationToken(userId, 'fetch-calendar');
      
      // Now requests should be active
      expect(service.isRequestActive(userId)).toBe(true);
      
      // Cancel the request
      service.cancelRequest(userId);
      
      // No requests should be active
      expect(service.isRequestActive(userId)).toBe(false);
    });
  });

  describe('getActiveRequestsCount', () => {
    it('should return correct count of active requests', () => {
      const userId = 'user1';
      
      // Initially no active requests
      expect(service.getActiveRequestsCount(userId)).toBe(0);
      
      // Create some requests
      service.createCancellationToken(userId, 'fetch-calendar');
      service.createCancellationToken(userId, 'fetch-events');
      
      // Should have 2 active requests
      expect(service.getActiveRequestsCount(userId)).toBe(2);
      
      // Cancel one request
      service.cancelRequest(userId, 'fetch-calendar');
      
      // Should have 1 active request
      expect(service.getActiveRequestsCount(userId)).toBe(1);
    });
  });
});