import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductivityStatistic } from '../entities/productivity-statistic.entity';
import { Task } from '../../tasks/entities/task.entity';
import { TimeBlock } from '../../time-blocks/entities/time-block.entity';
import { CreateStatisticDto } from '../dto/create-statistic.dto';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(ProductivityStatistic)
    private readonly statisticRepository: Repository<ProductivityStatistic>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TimeBlock)
    private readonly timeBlockRepository: Repository<TimeBlock>,
  ) {}

  /**
   * Calculate daily statistics for a user on a specific date
   */
  async calculateDailyStatistics(userId: string, date: Date): Promise<ProductivityStatistic> {
    try {
      // Get tasks created on the specified date
      const tasksCreated = await this.taskRepository.count({
        where: {
          userId,
          createdAt: date,
        },
      });

      // Get tasks completed on the specified date
      const tasksCompleted = await this.taskRepository.count({
        where: {
          userId,
          status: 'completed',
          completedAt: date,
        },
      });

      // Get overdue tasks as of the specified date
      const overdueTasks = await this.taskRepository.count({
        where: {
          userId,
          dueDate: date,
          status: 'pending',
        },
      });

      // Calculate completion rate
      const completionRate = tasksCreated > 0 ? tasksCompleted / tasksCreated : 0;

      // Get time tracked on the specified date
      const timeEntries = await this.timeBlockRepository.find({
        where: {
          userId,
        },
      });

      let totalTimeTracked = 0;
      timeEntries.forEach(entry => {
        if (entry.startTime && entry.endTime) {
          totalTimeTracked += (entry.endTime.getTime() - entry.startTime.getTime()) / 1000;
        }
      });

      // Calculate average completion time
      const completedTasks = await this.taskRepository.find({
        where: {
          userId,
          status: 'completed',
        },
      });

      let totalCompletionTime = 0;
      completedTasks.forEach(task => {
        if (task.createdAt && task.completedAt) {
          totalCompletionTime += (task.completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60); // in hours
        }
      });

      const averageCompletionTime = completedTasks.length > 0 ? totalCompletionTime / completedTasks.length : 0;

      // Create statistic DTO
      const statisticDto: CreateStatisticDto = {
        userId,
        date,
        tasksCompleted,
        tasksCreated,
        overdueTasks,
        completionRate,
        totalTimeTracked,
        averageCompletionTime,
      };

      // Save statistic
      const statistic = this.statisticRepository.create(statisticDto);
      return await this.statisticRepository.save(statistic);
    } catch (error) {
      this.logger.error(`Error calculating daily statistics for user ${userId} on ${date}: ${error.message}`);
      throw new ProductivityException(`Failed to calculate daily statistics: ${error.message}`);
    }
  }

  /**
   * Calculate statistics for a date range
   */
  async calculateDateRangeStatistics(userId: string, startDate: Date, endDate: Date): Promise<ProductivityStatistic[]> {
    try {
      const statistics: ProductivityStatistic[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const statistic = await this.calculateDailyStatistics(userId, new Date(currentDate));
        statistics.push(statistic);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return statistics;
    } catch (error) {
      this.logger.error(`Error calculating date range statistics for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to calculate date range statistics: ${error.message}`);
    }
  }

  /**
   * Calculate weekly statistics
   */
  async calculateWeeklyStatistics(userId: string, date: Date): Promise<ProductivityStatistic[]> {
    try {
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());

      // Get the end of the week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return await this.calculateDateRangeStatistics(userId, startOfWeek, endOfWeek);
    } catch (error) {
      this.logger.error(`Error calculating weekly statistics for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to calculate weekly statistics: ${error.message}`);
    }
  }

  /**
   * Calculate monthly statistics
   */
  async calculateMonthlyStatistics(userId: string, date: Date): Promise<ProductivityStatistic[]> {
    try {
      // Get the start of the month
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

      // Get the end of the month
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      return await this.calculateDateRangeStatistics(userId, startOfMonth, endOfMonth);
    } catch (error) {
      this.logger.error(`Error calculating monthly statistics for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to calculate monthly statistics: ${error.message}`);
    }
  }

  /**
   * Get statistics for a specific date
   */
  async getStatisticsByDate(userId: string, date: Date): Promise<ProductivityStatistic | null> {
    try {
      return await this.statisticRepository.findOne({
        where: {
          userId,
          date,
        },
      });
    } catch (error) {
      this.logger.error(`Error retrieving statistics for user ${userId} on ${date}: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve statistics: ${error.message}`);
    }
  }

  /**
   * Get statistics for a date range
   */
  async getStatisticsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ProductivityStatistic[]> {
    try {
      return await this.statisticRepository
        .createQueryBuilder('statistic')
        .where('statistic.userId = :userId', { userId })
        .andWhere('statistic.date >= :startDate', { startDate })
        .andWhere('statistic.date <= :endDate', { endDate })
        .orderBy('statistic.date', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error retrieving statistics for user ${userId} in date range: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve statistics: ${error.message}`);
    }
  }
}