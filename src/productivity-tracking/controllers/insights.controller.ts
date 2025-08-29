import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { InsightsService } from '../services/insights.service';
import { GetInsightsDto } from '../dto/get-insights.dto';
import { DismissInsightDto } from '../dto/dismiss-insight.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Insight } from '../entities/insight.entity';

@Controller('analytics/insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  private readonly logger = new Logger(InsightsController.name);

  constructor(private readonly insightsService: InsightsService) {}

  /**
   * Retrieve AI-powered productivity insights
   */
  @Get()
  async getProductivityInsights(@Query() getInsightsDto: GetInsightsDto): Promise<{
    generatedAt: Date;
    insights: Insight[];
  }> {
    try {
      const insights = await this.insightsService.getUserInsights(
        getInsightsDto.userId,
        getInsightsDto.startDate ? new Date(getInsightsDto.startDate) : undefined,
        getInsightsDto.endDate ? new Date(getInsightsDto.endDate) : undefined
      );
      
      return {
        generatedAt: new Date(),
        insights
      };
    } catch (error) {
      this.logger.error(`Error retrieving insights for user ${getInsightsDto.userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Dismiss a specific insight
   */
  @Post(':id/dismiss')
  async dismissInsight(
    @Param('id') insightId: string,
    @Body() dismissInsightDto: DismissInsightDto
  ): Promise<Insight> {
    try {
      return await this.insightsService.dismissInsight(insightId, dismissInsightDto.userId);
    } catch (error) {
      this.logger.error(`Error dismissing insight ${insightId}: ${error.message}`);
      throw error;
    }
  }
}