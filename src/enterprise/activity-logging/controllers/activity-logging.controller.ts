import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ActivityLoggingService } from '../services/activity-logging.service';
import { ActivityLog } from '../../entities/activity-log.entity';
import { ActivityLogQueryDto } from '../dtos/activity-log-query.dto';

@Controller()
export class ActivityLoggingController {
  constructor(private readonly activityLoggingService: ActivityLoggingService) {}

  @Get('users/:userId/activity-logs')
  @HttpCode(HttpStatus.OK)
  async getUserActivityLogs(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ): Promise<{ success: boolean; logs: ActivityLog[]; total: number }> {
    const { logs, total } = await this.activityLoggingService.getUserActivityLogs(userId, limit, offset);
    return {
      success: true,
      logs,
      total,
    };
  }

  @Get('activity-logs')
  @HttpCode(HttpStatus.OK)
  async getSystemActivityLogs(
    @Query() query: ActivityLogQueryDto,
  ): Promise<{ success: boolean; logs: ActivityLog[]; total: number }> {
    const { logs, total } = await this.activityLoggingService.getSystemActivityLogs(
      query.userId,
      query.action,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.limit,
      query.offset,
    );
    return {
      success: true,
      logs,
      total,
    };
  }

  @Get('activity-logs/export')
  @HttpCode(HttpStatus.OK)
  async exportActivityLogs(
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ): Promise<any> {
    const csvContent = await this.activityLoggingService.exportActivityLogs(
      format,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    
    if (res) {
      if (format === 'csv') {
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="activity-logs.csv"');
      } else {
        res.header('Content-Type', 'application/json');
        res.header('Content-Disposition', 'attachment; filename="activity-logs.json"');
      }
      return res.send(csvContent);
    }
    
    return {
      success: true,
      data: csvContent,
    };
  }
}