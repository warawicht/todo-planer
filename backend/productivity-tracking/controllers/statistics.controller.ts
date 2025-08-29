import { Controller, Get, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { StatisticsService } from '../services/statistics.service';
import { ProductivityException } from '../exceptions/productivity.exception';

@Controller('productivity/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * Retrieve productivity statistics for a given date range
   */
  @Get()
  async getStatistics(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ) {
    try {
      if (!userId || !startDate || !endDate) {
        throw new ProductivityException('userId, startDate, and endDate are required');
      }

      const statistics = await this.statisticsService.calculateDateRangeStatistics(userId, startDate, endDate);
      
      // Calculate summary
      let totalTasksCompleted = 0;
      let totalTasksCreated = 0;
      let totalTimeTracked = 0;
      
      statistics.forEach(stat => {
        totalTasksCompleted += stat.tasksCompleted;
        totalTasksCreated += stat.tasksCreated;
        totalTimeTracked += stat.totalTimeTracked;
      });
      
      const avgCompletionRate = totalTasksCreated > 0 ? totalTasksCompleted / totalTasksCreated : 0;
      
      return {
        dailyStats: statistics,
        summary: {
          totalTasksCompleted,
          totalTasksCreated,
          avgCompletionRate,
          totalTimeTracked,
        },
      };
    } catch (error) {
      throw new ProductivityException(`Failed to retrieve statistics: ${error.message}`);
    }
  }

  /**
   * Retrieve productivity statistics for a specific date
   */
  @Get(':date')
  async getStatisticsByDate(
    @Param('date', ParseDatePipe) date: Date,
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    try {
      if (!userId || !date) {
        throw new ProductivityException('userId and date are required');
      }

      const statistic = await this.statisticsService.calculateDailyStatistics(userId, date);
      return statistic;
    } catch (error) {
      throw new ProductivityException(`Failed to retrieve statistics: ${error.message}`);
    }
  }
}