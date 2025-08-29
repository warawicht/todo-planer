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
import { AuditTrailService } from '../services/audit-trail.service';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { AuditTrailQueryDto } from '../dtos/audit-trail-query.dto';

@Controller()
export class AuditTrailController {
  constructor(private readonly auditTrailService: AuditTrailService) {}

  @Get('users/:userId/audit-trail')
  @HttpCode(HttpStatus.OK)
  async getUserAuditTrail(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ): Promise<{ success: boolean; auditTrails: AuditTrail[]; total: number }> {
    const { auditTrails, total } = await this.auditTrailService.getUserAuditTrail(userId, limit, offset);
    return {
      success: true,
      auditTrails,
      total,
    };
  }

  @Get('audit-trail')
  @HttpCode(HttpStatus.OK)
  async getAuditTrailEntries(
    @Query() query: AuditTrailQueryDto,
  ): Promise<{ success: boolean; auditTrails: AuditTrail[]; total: number }> {
    const { auditTrails, total } = await this.auditTrailService.getAuditTrailEntries(
      query.resourceType,
      query.resourceId,
      query.userId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.limit,
      query.offset,
    );
    return {
      success: true,
      auditTrails,
      total,
    };
  }

  @Get('audit-trail/export')
  @HttpCode(HttpStatus.OK)
  async exportAuditTrail(
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ): Promise<any> {
    const csvContent = await this.auditTrailService.exportAuditTrail(
      format,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    
    if (res) {
      if (format === 'csv') {
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="audit-trail.csv"');
      } else {
        res.header('Content-Type', 'application/json');
        res.header('Content-Disposition', 'attachment; filename="audit-trail.json"');
      }
      return res.send(csvContent);
    }
    
    return {
      success: true,
      data: csvContent,
    };
  }
}