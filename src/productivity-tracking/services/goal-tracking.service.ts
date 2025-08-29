import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from '../entities/goal.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class GoalTrackingService {
  private readonly logger = new Logger(GoalTrackingService.name);

  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Create a new productivity goal
   */
  async createGoal(goalData: Partial<Goal>): Promise<Goal> {
    try {
      const goal = this.goalRepository.create(goalData);
      return await this.goalRepository.save(goal);
    } catch (error) {
      this.logger.error(`Error creating goal: ${error.message}`);
      throw new ProductivityException(`Failed to create goal: ${error.message}`);
    }
  }

  /**
   * Get user's productivity goals
   */
  async getUserGoals(userId: string, activeOnly: boolean = false): Promise<Goal[]> {
    try {
      let query = this.goalRepository.createQueryBuilder('goal')
        .where('goal.userId = :userId', { userId });

      if (activeOnly) {
        query = query.andWhere('goal.completedAt IS NULL')
          .andWhere('goal.endDate >= :currentDate', { currentDate: new Date() });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.error(`Error retrieving goals for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve goals: ${error.message}`);
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, userId: string): Promise<Goal> {
    try {
      const goal = await this.goalRepository.findOne({
        where: { id: goalId, userId }
      });

      if (!goal) {
        throw new ProductivityException('Goal not found');
      }

      // Calculate current progress based on goal metric
      const currentValue = await this.calculateGoalProgress(goal);
      goal.currentValue = currentValue;

      // Check if goal is completed
      if (goal.currentValue >= goal.targetValue && !goal.completedAt) {
        goal.completedAt = new Date();
      }

      return await this.goalRepository.save(goal);
    } catch (error) {
      this.logger.error(`Error updating goal progress for goal ${goalId}: ${error.message}`);
      throw new ProductivityException(`Failed to update goal progress: ${error.message}`);
    }
  }

  /**
   * Calculate goal progress based on metric type
   */
  private async calculateGoalProgress(goal: Goal): Promise<number> {
    switch (goal.metric) {
      case 'time_tracked':
        // Calculate total time tracked in seconds during goal period
        const timeEntries = await this.timeEntryRepository.createQueryBuilder('timeEntry')
          .where('timeEntry.userId = :userId', { userId: goal.userId })
          .andWhere('timeEntry.startTime >= :startDate', { startDate: goal.startDate })
          .andWhere('timeEntry.startTime <= :endDate', { endDate: goal.endDate })
          .getMany();

        return timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);

      case 'tasks_completed':
        // Count completed tasks during goal period
        return await this.taskRepository.createQueryBuilder('task')
          .where('task.userId = :userId', { userId: goal.userId })
          .andWhere('task.completed = true')
          .andWhere('task.updatedAt >= :startDate', { startDate: goal.startDate })
          .andWhere('task.updatedAt <= :endDate', { endDate: goal.endDate })
          .getCount();

      case 'projects_completed':
        // For this example, we'll assume projects are in the tasks module
        // In a real implementation, you would have a projects repository
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Get goal statistics and progress
   */
  async getGoalStatistics(userId: string): Promise<any> {
    try {
      const goals = await this.getUserGoals(userId);
      
      const activeGoals = goals.filter(goal => !goal.completedAt && goal.endDate >= new Date());
      const completedGoals = goals.filter(goal => goal.completedAt);
      const overdueGoals = goals.filter(goal => !goal.completedAt && goal.endDate < new Date());
      
      // Calculate completion rate
      const completionRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;
      
      return {
        totalGoals: goals.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        overdueGoals: overdueGoals.length,
        completionRate: parseFloat(completionRate.toFixed(2))
      };
    } catch (error) {
      this.logger.error(`Error calculating goal statistics for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to calculate goal statistics: ${error.message}`);
    }
  }

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string, userId: string): Promise<void> {
    try {
      const goal = await this.goalRepository.findOne({
        where: { id: goalId, userId }
      });

      if (!goal) {
        throw new ProductivityException('Goal not found');
      }

      await this.goalRepository.remove(goal);
    } catch (error) {
      this.logger.error(`Error deleting goal ${goalId}: ${error.message}`);
      throw new ProductivityException(`Failed to delete goal: ${error.message}`);
    }
  }
}