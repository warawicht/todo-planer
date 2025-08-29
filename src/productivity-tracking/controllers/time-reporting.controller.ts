import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { TimeReportingService } from '../services/time-reporting.service';
import { TimeReportDto } from '../dto/time-report.dto';
import { ExportTimeReportDto } from '../dto/export-time-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('analytics/time-report')
@UseGuards(JwtAuthGuard)
export class TimeReportingController {
  private readonly logger = new Logger(TimeReportingController.name);

  constructor(private readonly timeReportingService: TimeReportingService) {}

  /**
   * Retrieve detailed time reports for tasks and projects
   */
  @Get()
  async getTimeReport(@Query() timeReportDto: TimeReportDto): Promise<any> {
    try {
      return await this.timeReportingService.generateTimeReport(
        timeReportDto.userId,
        new Date(timeReportDto.startDate),
        new Date(timeReportDto.endDate),
        timeReportDto.projectId,
        timeReportDto.taskId
      );
    } catch (error) {
      this.logger.error(`Error generating time report for user ${timeReportDto.userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export time report in specified format
   */
  @Post('export')
  async exportTimeReport(@Body() exportTimeReportDto: ExportTimeReportDto): Promise<any> {
    try {
      return await this.timeReportingService.exportTimeReport(
        exportTimeReportDto.userId,
        new Date(exportTimeReportDto.startDate),
        new Date(exportTimeReportDto.endDate),
        exportTimeReportDto.format,
        exportTimeReportDto.projectId,
        exportTimeReportDto.taskId,
        exportTimeReportDto.billableRate
      );
    } catch (error) {
      this.logger.error(`Error exporting time report for user ${exportTimeReportDto.userId}: ${error.message}`);
      throw error;
    }
  }
}