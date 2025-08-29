import { Test, TestingModule } from '@nestjs/testing';
import { NavigationDebounceService } from './navigation-debounce.service';

describe('NavigationDebounceService', () => {
  let service: NavigationDebounceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NavigationDebounceService],
    }).compile();

    service = module.get<NavigationDebounceService>(NavigationDebounceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('debounceNavigation', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should execute callback after debounce delay', async () => {
      const userId = 'user1';
      const action = 'navigate-next';
      const callback = jest.fn().mockResolvedValue('result');
      
      const promise = service.debounceNavigation(userId, action, callback, 100);
      
      // Fast-forward until all timers are executed
      jest.advanceTimersByTime(100);
      
      const result = await promise;
      
      expect(callback).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should debounce multiple calls to the same action', async () => {
      const userId = 'user1';
      const action = 'navigate-next';
      const callback = jest.fn().mockResolvedValue('result');
      
      // Call debounceNavigation multiple times rapidly
      service.debounceNavigation(userId, action, callback, 100);
      service.debounceNavigation(userId, action, callback, 100);
      const promise = service.debounceNavigation(userId, action, callback, 100);
      
      // Fast-forward until all timers are executed
      jest.advanceTimersByTime(100);
      
      // Only the last call should execute
      const result = await promise;
      
      // Callback should only be called once
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
    });

    it('should handle different actions separately', async () => {
      const userId = 'user1';
      const callback1 = jest.fn().mockResolvedValue('result1');
      const callback2 = jest.fn().mockResolvedValue('result2');
      
      const promise1 = service.debounceNavigation(userId, 'navigate-next', callback1, 100);
      const promise2 = service.debounceNavigation(userId, 'navigate-previous', callback2, 100);
      
      // Fast-forward until all timers are executed
      jest.advanceTimersByTime(100);
      
      await promise1;
      await promise2;
      
      // Both callbacks should be called
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle errors in callback', async () => {
      const userId = 'user1';
      const action = 'navigate-next';
      const error = new Error('Test error');
      const callback = jest.fn().mockRejectedValue(error);
      
      const promise = service.debounceNavigation(userId, action, callback, 100);
      
      // Fast-forward until all timers are executed
      jest.advanceTimersByTime(100);
      
      await expect(promise).rejects.toThrow('Test error');
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('cancelDebounce', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should cancel specific debounced action', async () => {
      const userId = 'user1';
      const action = 'navigate-next';
      const callback = jest.fn().mockResolvedValue('result');
      
      service.debounceNavigation(userId, action, callback, 100);
      
      // Cancel the debounced action
      service.cancelDebounce(userId, action);
      
      // Fast-forward to ensure the timer would have executed
      jest.advanceTimersByTime(100);
      
      // Callback should not have been called
      expect(callback).not.toHaveBeenCalled();
    });

    it('should cancel all debounced actions for a user', async () => {
      const userId = 'user1';
      const callback1 = jest.fn().mockResolvedValue('result1');
      const callback2 = jest.fn().mockResolvedValue('result2');
      
      service.debounceNavigation(userId, 'navigate-next', callback1, 100);
      service.debounceNavigation(userId, 'navigate-previous', callback2, 100);
      
      // Cancel all actions for this user
      service.cancelDebounce(userId);
      
      // Fast-forward to ensure the timers would have executed
      jest.advanceTimersByTime(100);
      
      // Callbacks should not have been called
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('getPendingActionsCount', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should return correct count of pending actions', async () => {
      const userId = 'user1';
      const callback = jest.fn().mockResolvedValue('result');
      
      // Initially no pending actions
      expect(service.getPendingActionsCount(userId)).toBe(0);
      
      // Add some pending actions
      service.debounceNavigation(userId, 'navigate-next', callback, 100);
      service.debounceNavigation(userId, 'navigate-previous', callback, 100);
      
      // Should have 2 pending actions
      expect(service.getPendingActionsCount(userId)).toBe(2);
      
      // Fast-forward to execute one action
      jest.advanceTimersByTime(100);
      
      // Wait for next tick to ensure timers are processed
      await Promise.resolve();
      
      // Should have 0 pending actions now
      expect(service.getPendingActionsCount(userId)).toBe(0);
    });
  });
});