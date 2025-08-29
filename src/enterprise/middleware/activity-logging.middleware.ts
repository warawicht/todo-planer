import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../entities/activity-log.entity';

@Injectable()
export class ActivityLoggingMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Capture request details
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent');
    const ipAddress = this.getClientIp(req);
    
    // Get user from request if available
    const user = (req as any).user;
    const userId = user ? user.id : null;

    // Wait for the response to finish
    res.on('finish', async () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const statusCode = res.statusCode;

      // Log the activity
      try {
        const activityLog = this.activityLogRepository.create({
          userId,
          action: `${method} ${url}`,
          metadata: {
            method,
            url,
            statusCode,
            duration,
            userAgent,
          },
          ipAddress,
          userAgent,
        });

        await this.activityLogRepository.save(activityLog);
      } catch (error) {
        // Log error silently to avoid disrupting the response
        console.error('Error logging activity:', error);
      }
    });

    next();
  }

  private getClientIp(req: Request): string {
    // Check various headers for client IP
    return (
      (req.headers['x-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      (req.headers['x-client-ip'] as string) ||
      (req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection as any).socket?.remoteAddress ||
        '')
    );
  }
}