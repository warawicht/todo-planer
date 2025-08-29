import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RequestCancellationService {
  private readonly logger = new Logger(RequestCancellationService.name);
  private readonly activeRequests: Map<string, AbortController> = new Map();

  /**
   * Create a cancellable request token for a user action
   * @param userId The user ID
   * @param action The action identifier
   * @returns An object containing the AbortSignal and a function to cancel the request
   */
  createCancellationToken(userId: string, action: string): { 
    signal: AbortSignal; 
    cancel: () => void 
  } {
    const key = `${userId}:${action}`;
    
    // Cancel any existing request for this user/action combination
    this.cancelRequest(userId, action);
    
    // Create a new AbortController for this request
    const abortController = new AbortController();
    
    // Store the AbortController
    this.activeRequests.set(key, abortController);
    
    // Return the signal and cancel function
    return {
      signal: abortController.signal,
      cancel: () => this.cancelRequest(userId, action)
    };
  }

  /**
   * Cancel an active request for a user
   * @param userId The user ID
   * @param action Optional specific action to cancel
   */
  cancelRequest(userId: string, action?: string): void {
    if (action) {
      const key = `${userId}:${action}`;
      const abortController = this.activeRequests.get(key);
      
      if (abortController) {
        this.logger.debug(`Cancelling request: ${key}`);
        abortController.abort();
        this.activeRequests.delete(key);
      }
    } else {
      // Cancel all requests for this user
      for (const [key, abortController] of this.activeRequests.entries()) {
        if (key.startsWith(`${userId}:`)) {
          this.logger.debug(`Cancelling request: ${key}`);
          abortController.abort();
          this.activeRequests.delete(key);
        }
      }
    }
  }

  /**
   * Check if a request is active for a user
   * @param userId The user ID
   * @param action Optional specific action to check
   * @returns True if there's an active request, false otherwise
   */
  isRequestActive(userId: string, action?: string): boolean {
    if (action) {
      const key = `${userId}:${action}`;
      return this.activeRequests.has(key);
    } else {
      // Check if any requests are active for this user
      for (const key of this.activeRequests.keys()) {
        if (key.startsWith(`${userId}:`)) {
          return true;
        }
      }
      return false;
    }
  }

  /**
   * Get the number of active requests for a user
   * @param userId The user ID
   * @returns The number of active requests
   */
  getActiveRequestsCount(userId: string): number {
    let count = 0;
    for (const key of this.activeRequests.keys()) {
      if (key.startsWith(`${userId}:`)) {
        count++;
      }
    }
    return count;
  }
}