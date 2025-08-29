import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities/activity-log.entity';
import { User } from '../../../users/user.entity';

@Injectable()
export class ActivityLoggingService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createActivityLog(
    userId: string,
    action: string,
    metadata: any = {},
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActivityLog> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const activityLog = this.activityLogRepository.create({
      userId,
      action,
      metadata,
      ipAddress,
      userAgent,
    });
    
    return this.activityLogRepository.save(activityLog);
  }

  async getUserActivityLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ logs: ActivityLog[]; total: number }> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const [logs, total] = await this.activityLogRepository
      .createQueryBuilder('activityLog')
      .where('activityLog.userId = :userId', { userId })
      .orderBy('activityLog.timestamp', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
      
    return { logs, total };
  }

  async getSystemActivityLogs(
    userId?: string,
    action?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ logs: ActivityLog[]; total: number }> {
    const queryBuilder = this.activityLogRepository.createQueryBuilder('activityLog');
    
    if (userId) {
      queryBuilder.andWhere('activityLog.userId = :userId', { userId });
    }
    
    if (action) {
      queryBuilder.andWhere('activityLog.action = :action', { action });
    }
    
    if (startDate) {
      queryBuilder.andWhere('activityLog.timestamp >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('activityLog.timestamp <= :endDate', { endDate });
    }
    
    const [logs, total] = await queryBuilder
      .orderBy('activityLog.timestamp', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
      
    return { logs, total };
  }

  async exportActivityLogs(
    format: 'csv' | 'json',
    startDate?: Date,
    endDate?: Date,
  ): Promise<string> {
    const queryBuilder = this.activityLogRepository.createQueryBuilder('activityLog');
    
    if (startDate) {
      queryBuilder.andWhere('activityLog.timestamp >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('activityLog.timestamp <= :endDate', { endDate });
    }
    
    const logs = await queryBuilder
      .orderBy('activityLog.timestamp', 'DESC')
      .getMany();
      
    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['ID', 'User ID', 'Action', 'Timestamp', 'IP Address', 'User Agent'];
      const csvRows = logs.map(log => [
        log.id,
        log.userId,
        log.action,
        log.timestamp.toISOString(),
        log.ipAddress || '',
        log.userAgent || '',
      ]);
      
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
        
      return csvContent;
    } else {
      // Convert to JSON format
      return JSON.stringify(logs, null, 2);
    }
  }
}