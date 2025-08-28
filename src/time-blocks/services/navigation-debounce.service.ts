import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NavigationDebounceService {
  private readonly logger = new Logger(NavigationDebounceService.name);
  private readonly debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly defaultDebounceDelay = 300; // 300ms default debounce delay

  /**
   * Debounce a navigation action
   * @param userId The user ID
   * @param action The navigation action identifier
   * @param callback The function to execute after debouncing
   * @param delay The debounce delay in milliseconds (default: 300ms)
   * @returns A promise that resolves when the debounced action completes
   */
  async debounceNavigation(
    userId: string,
    action: string,
    callback: () => Promise<any>,
    delay: number = this.defaultDebounceDelay
  ): Promise<any> {
    const key = `${userId}:${action}`;
    
    // Clear any existing timer for this user/action combination
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
      this.debounceTimers.delete(key);
    }
    
    // Create a new timer
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          this.logger.debug(`Executing debounced navigation action: ${key}`);
          this.debounceTimers.delete(key);
          const result = await callback();
          resolve(result);
        } catch (error) {
          this.logger.error(`Error in debounced navigation action: ${key}`, error);
          reject(error);
        }
      }, delay);
      
      this.debounceTimers.set(key, timer);
    });
  }

  /**
   * Cancel any pending debounced navigation for a user
   * @param userId The user ID
   * @param action Optional specific action to cancel
   */
  cancelDebounce(userId: string, action?: string): void {
    if (action) {
      const key = `${userId}:${action}`;
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
        this.debounceTimers.delete(key);
        this.logger.debug(`Cancelled debounced navigation action: ${key}`);
      }
    } else {
      // Cancel all debounced actions for this user
      for (const [key, timer] of this.debounceTimers.entries()) {
        if (key.startsWith(`${userId}:`)) {
          clearTimeout(timer);
          this.debounceTimers.delete(key);
          this.logger.debug(`Cancelled debounced navigation action: ${key}`);
        }
      }
    }
  }

  /**
   * Get the number of pending debounced actions for a user
   * @param userId The user ID
   * @returns The number of pending debounced actions
   */
  getPendingActionsCount(userId: string): number {
    let count = 0;
    for (const key of this.debounceTimers.keys()) {
      if (key.startsWith(`${userId}:`)) {
        count++;
      }
    }
    return count;
  }
}