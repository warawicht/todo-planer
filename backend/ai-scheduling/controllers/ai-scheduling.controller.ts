import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SchedulingSuggestionService } from '../services/scheduling-suggestion.service';
import { ProductivityPatternService } from '../services/productivity-pattern.service';
import { TaskPrioritizationService } from '../services/task-prioritization.service';
import { NLPProcessingService } from '../services/nlp-processing.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AISchedulingController {
  constructor(
    private readonly schedulingSuggestionService: SchedulingSuggestionService,
    private readonly productivityPatternService: ProductivityPatternService,
    private readonly taskPrioritizationService: TaskPrioritizationService,
    private readonly nlpProcessingService: NLPProcessingService,
  ) {}

  // Scheduling Suggestions API

  @Get('suggestions/scheduling')
  async getSchedulingSuggestions(
    @Query('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.schedulingSuggestionService.generateSchedulingSuggestions(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('suggestions/scheduling/:id/apply')
  async applySchedulingSuggestion(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.schedulingSuggestionService.applySchedulingSuggestion(userId, id);
  }

  @Post('suggestions/:id/dismiss')
  async dismissSuggestion(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.schedulingSuggestionService.dismissSuggestion(userId, id);
  }

  // Productivity Patterns API

  @Get('patterns')
  async getProductivityPatterns(
    @Query('userId') userId: string,
    @Query('type') type?: string,
  ) {
    return this.productivityPatternService.identifyProductivityPatterns(userId);
  }

  @Post('patterns/refresh')
  async refreshProductivityPatterns(@Body('userId') userId: string) {
    const success = await this.productivityPatternService.refreshProductivityPatterns(userId);
    return { success, message: success ? 'Patterns refreshed successfully' : 'Failed to refresh patterns' };
  }

  // Task Prioritization API

  @Get('prioritization')
  async getTaskPrioritization(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.taskPrioritizationService.generatePriorityRecommendations(userId, limit);
  }

  @Post('prioritization/:taskId/apply')
  async applyTaskPrioritization(
    @Param('taskId') taskId: string,
    @Body('userId') userId: string,
  ) {
    return this.taskPrioritizationService.applyPriorityRecommendation(userId, taskId, taskId);
  }

  // NLP Task Creation API

  @Post('nlp/tasks')
  async createTaskWithNLP(
    @Body('userId') userId: string,
    @Body('text') text: string,
  ) {
    return this.nlpProcessingService.processNaturalLanguageInput(userId, text);
  }

  @Post('nlp/tasks/:id/review')
  async reviewNLPProcessedTask(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body() reviewData: any,
  ) {
    return this.nlpProcessingService.reviewNLPProcessedTask(userId, id, reviewData);
  }
}