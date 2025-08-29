import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { GoalTrackingService } from '../services/goal-tracking.service';
import { CreateGoalDto } from '../dto/create-goal.dto';
import { UpdateGoalDto } from '../dto/update-goal.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Goal } from '../entities/goal.entity';

@Controller('analytics/goals')
@UseGuards(JwtAuthGuard)
export class GoalTrackingController {
  private readonly logger = new Logger(GoalTrackingController.name);

  constructor(private readonly goalTrackingService: GoalTrackingService) {}

  /**
   * Create a new productivity goal
   */
  @Post()
  async createGoal(@Body() createGoalDto: CreateGoalDto): Promise<Goal> {
    try {
      return await this.goalTrackingService.createGoal(createGoalDto);
    } catch (error) {
      this.logger.error(`Error creating goal: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve user's productivity goals
   */
  @Get()
  async getUserGoals(
    @Query('userId') userId: string,
    @Query('activeOnly') activeOnly: boolean = false
  ): Promise<Goal[]> {
    try {
      return await this.goalTrackingService.getUserGoals(userId, activeOnly);
    } catch (error) {
      this.logger.error(`Error retrieving goals for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update goal progress
   */
  @Put(':id')
  async updateGoalProgress(
    @Param('id') goalId: string,
    @Body() updateGoalDto: UpdateGoalDto
  ): Promise<Goal> {
    try {
      return await this.goalTrackingService.updateGoalProgress(goalId, updateGoalDto.userId);
    } catch (error) {
      this.logger.error(`Error updating goal progress for goal ${goalId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get goal statistics and progress
   */
  @Get('statistics')
  async getGoalStatistics(@Query('userId') userId: string): Promise<any> {
    try {
      return await this.goalTrackingService.getGoalStatistics(userId);
    } catch (error) {
      this.logger.error(`Error calculating goal statistics for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a goal
   */
  @Delete(':id')
  async deleteGoal(
    @Param('id') goalId: string,
    @Query('userId') userId: string
  ): Promise<void> {
    try {
      return await this.goalTrackingService.deleteGoal(goalId, userId);
    } catch (error) {
      this.logger.error(`Error deleting goal ${goalId}: ${error.message}`);
      throw error;
    }
  }
}