import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ReportGenerationService } from '../services/report-generation.service';
import { CreateReportTemplateDto } from '../dto/create-report-template.dto';
import { GenerateReportDto } from '../dto/generate-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportTemplate } from '../entities/report-template.entity';

@Controller('analytics/reports')
@UseGuards(JwtAuthGuard)
export class ReportGenerationController {
  private readonly logger = new Logger(ReportGenerationController.name);

  constructor(private readonly reportGenerationService: ReportGenerationService) {}

  /**
   * Create a customizable report template
   */
  @Post('templates')
  async createReportTemplate(@Body() createReportTemplateDto: CreateReportTemplateDto): Promise<ReportTemplate> {
    try {
      return await this.reportGenerationService.createReportTemplate(createReportTemplateDto);
    } catch (error) {
      this.logger.error(`Error creating report template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve user's report templates
   */
  @Get('templates')
  async getUserReportTemplates(@Query('userId') userId: string): Promise<ReportTemplate[]> {
    try {
      return await this.reportGenerationService.getUserReportTemplates(userId);
    } catch (error) {
      this.logger.error(`Error retrieving report templates for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a report based on template and parameters
   */
  @Post('generate')
  async generateReport(@Body() generateReportDto: GenerateReportDto): Promise<any> {
    try {
      const { userId, templateId, startDate, endDate } = generateReportDto;
      return await this.reportGenerationService.generateReport(userId, templateId, new Date(startDate), new Date(endDate));
    } catch (error) {
      this.logger.error(`Error generating report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a report template
   */
  @Delete('templates/:id')
  async deleteReportTemplate(
    @Param('id') templateId: string,
    @Query('userId') userId: string
  ): Promise<void> {
    try {
      return await this.reportGenerationService.deleteReportTemplate(templateId, userId);
    } catch (error) {
      this.logger.error(`Error deleting report template ${templateId}: ${error.message}`);
      throw error;
    }
  }
}