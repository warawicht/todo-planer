import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from './rate-limit.service';

// Extend the Request interface to include our User type
interface AuthenticatedRequest extends Request {
  user?: any;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly rateLimitService: RateLimitService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress;
    const endpoint = req.originalUrl;
    const method = req.method;

    // Create a unique key for this IP + endpoint + method
    const ipKey = `${ip}:${endpoint}:${method}`;
    
    // Check IP-based rate limit (10 requests per minute)
    const ipLimit = await this.rateLimitService.isRateLimited(ipKey, 10, 60);
    
    if (ipLimit.isLimited) {
      return res.status(429).json({
        statusCode: 429,
        message: 'Too Many Requests',
        error: 'Rate limit exceeded',
        resetTime: ipLimit.resetTime,
      });
    }

    // Also create a key for user-based rate limiting if user is authenticated
    if (req.user) {
      const userKey = `user:${req.user.id}:${endpoint}:${method}`;
      // Higher limit for authenticated users (20 requests per minute)
      const userLimit = await this.rateLimitService.isRateLimited(userKey, 20, 60);
      
      if (userLimit.isLimited) {
        return res.status(429).json({
          statusCode: 429,
          message: 'Too Many Requests',
          error: 'Rate limit exceeded',
          resetTime: userLimit.resetTime,
        });
      }
    }

    next();
  }
}