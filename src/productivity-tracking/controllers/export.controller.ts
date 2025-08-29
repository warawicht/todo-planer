import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ExportService } from '../services/export.service';
import { ExportDataDto } from '../dto/export-data.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AnalyticsExport } from '../entities/analytics-export.entity';

@Controller('analytics/export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  /**
   * Export analytics data in specified format
   */
  @Post()
  async exportData(@Body() exportDataDto: ExportDataDto): Promise<AnalyticsExport> {
    try {
      const exportRequest = await this.exportService.createExportRequest(exportDataDto);
      // In a real implementation, this would be processed asynchronously
      // For now, we'll process it immediately
      return await this.exportService.processExport(exportRequest.id, exportDataDto.userId);
    } catch (error) {
      this.logger.error(`Error creating export request: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve user's export requests
   */
  @Get()
  async getUserExports(
    @Query('userId') userId: string,
    @Query('status') status?: string
  ): Promise<AnalyticsExport[]> {
    try {
      return await this.exportService.getUserExports(userId, status);
    } catch (error) {
      this.logger.error(`Error retrieving export requests for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get export by ID
   */
  @Get(':id')
  async getExportById(
    @Param('id') exportId: string,
    @Query('userId') userId: string
  ): Promise<AnalyticsExport> {
    try {
      return await this.exportService.getExportById(exportId, userId);
    } catch (error) {
      this.logger.error(`Error retrieving export ${exportId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel an export request
   */
  @Post(':id/cancel')
  async cancelExport(
    @Param('id') exportId: string,
    @Query('userId') userId: string
  ): Promise<void> {
    try {
      return await this.exportService.cancelExport(exportId, userId);
    } catch (error) {
      this.logger.error(`Error cancelling export ${exportId}: ${error.message}`);
      throw error;
    }
  }
}