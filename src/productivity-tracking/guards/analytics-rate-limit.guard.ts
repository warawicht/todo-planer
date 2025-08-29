import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class AnalyticsRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(AnalyticsRateLimitGuard.name);
  private readonly requestCounts = new Map<string, { count: number; timestamp: number }>();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    
    if (!userId) {
      return true; // If no user ID, skip rate limiting
    }
    
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = 10; // Max 10 requests per minute
    
    const userRequestData = this.requestCounts.get(userId) || { count: 0, timestamp: now };
    
    // Reset count if window has passed
    if (now - userRequestData.timestamp > windowMs) {
      userRequestData.count = 0;
      userRequestData.timestamp = now;
    }
    
    // Increment count
    userRequestData.count++;
    this.requestCounts.set(userId, userRequestData);
    
    // Check if limit exceeded
    if (userRequestData.count > maxRequests) {
      this.logger.warn(`Rate limit exceeded for user ${userId}`);
      throw new ProductivityException('Rate limit exceeded. Please try again later.');
    }
    
    return true;
  }
}