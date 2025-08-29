import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { User } from '../../../users/user.entity';

@Injectable()
export class AuditTrailService {
  constructor(
    @InjectRepository(AuditTrail)
    private auditTrailRepository: Repository<AuditTrail>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createAuditTrail(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    beforeState: any = null,
    afterState: any = null,
    ipAddress?: string,
  ): Promise<AuditTrail> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const auditTrail = this.auditTrailRepository.create({
      userId,
      action,
      resourceType,
      resourceId,
      beforeState,
      afterState,
      ipAddress,
    });
    
    return this.auditTrailRepository.save(auditTrail);
  }

  async getUserAuditTrail(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ auditTrails: AuditTrail[]; total: number }> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const [auditTrails, total] = await this.auditTrailRepository
      .createQueryBuilder('auditTrail')
      .where('auditTrail.userId = :userId', { userId })
      .orderBy('auditTrail.timestamp', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
      
    return { auditTrails, total };
  }

  async getAuditTrailEntries(
    resourceType?: string,
    resourceId?: string,
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ auditTrails: AuditTrail[]; total: number }> {
    const queryBuilder = this.auditTrailRepository.createQueryBuilder('auditTrail');
    
    if (resourceType) {
      queryBuilder.andWhere('auditTrail.resourceType = :resourceType', { resourceType });
    }
    
    if (resourceId) {
      queryBuilder.andWhere('auditTrail.resourceId = :resourceId', { resourceId });
    }
    
    if (userId) {
      queryBuilder.andWhere('auditTrail.userId = :userId', { userId });
    }
    
    if (startDate) {
      queryBuilder.andWhere('auditTrail.timestamp >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('auditTrail.timestamp <= :endDate', { endDate });
    }
    
    const [auditTrails, total] = await queryBuilder
      .orderBy('auditTrail.timestamp', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
      
    return { auditTrails, total };
  }

  async exportAuditTrail(
    format: 'csv' | 'json',
    startDate?: Date,
    endDate?: Date,
  ): Promise<string> {
    const queryBuilder = this.auditTrailRepository.createQueryBuilder('auditTrail');
    
    if (startDate) {
      queryBuilder.andWhere('auditTrail.timestamp >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('auditTrail.timestamp <= :endDate', { endDate });
    }
    
    const auditTrails = await queryBuilder
      .orderBy('auditTrail.timestamp', 'DESC')
      .getMany();
      
    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'ID',
        'User ID',
        'Action',
        'Resource Type',
        'Resource ID',
        'Timestamp',
        'IP Address',
      ];
      const csvRows = auditTrails.map(trail => [
        trail.id,
        trail.userId,
        trail.action,
        trail.resourceType,
        trail.resourceId,
        trail.timestamp.toISOString(),
        trail.ipAddress || '',
      ]);
      
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
        
      return csvContent;
    } else {
      // Convert to JSON format
      return JSON.stringify(auditTrails, null, 2);
    }
  }
}