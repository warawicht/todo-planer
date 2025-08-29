import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrendData } from '../entities/trend-data.entity';
import { ProductivityStatistic } from '../entities/productivity-statistic.entity';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class TrendAnalysisService {
  private readonly logger = new Logger(TrendAnalysisService.name);

  constructor(
    @InjectRepository(TrendData)
    private readonly trendDataRepository: Repository<TrendData>,
    @InjectRepository(ProductivityStatistic)
    private readonly statisticRepository: Repository<ProductivityStatistic>,
  ) {}

  /**
   * Analyze trends for a given period
   */
  async analyzeTrends(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date,
  ): Promise<TrendData> {
    try {
      // Get statistics for the date range
      const statistics = await this.statisticRepository.find({
        where: {
          userId,
          date: startDate,
        },
      });

      // Group statistics by period
      const groupedData: any = {};

      statistics.forEach(stat => {
        let key: string;
        switch (period) {
          case 'daily':
            key = stat.date.toISOString().split('T')[0];
            break;
          case 'weekly':
            // Get week number
            const weekNumber = this.getWeekNumber(stat.date);
            key = `${stat.date.getFullYear()}-W${weekNumber}`;
            break;
          case 'monthly':
            key = `${stat.date.getFullYear()}-${(stat.date.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          default:
            key = stat.date.toISOString().split('T')[0];
        }

        if (!groupedData[key]) {
          groupedData[key] = {
            tasksCompleted: 0,
            tasksCreated: 0,
            overdueTasks: 0,
            totalTimeTracked: 0,
            count: 0,
          };
        }

        groupedData[key].tasksCompleted += stat.tasksCompleted;
        groupedData[key].tasksCreated += stat.tasksCreated;
        groupedData[key].overdueTasks += stat.overdueTasks;
        groupedData[key].totalTimeTracked += stat.totalTimeTracked;
        groupedData[key].count += 1;
      });

      // Calculate averages
      const trendData: any[] = [];
      for (const key in groupedData) {
        if (groupedData.hasOwnProperty(key)) {
          const data = groupedData[key];
          trendData.push({
            period: key,
            tasksCompleted: data.tasksCompleted,
            tasksCreated: data.tasksCreated,
            overdueTasks: data.overdueTasks,
            completionRate: data.tasksCreated > 0 ? data.tasksCompleted / data.tasksCreated : 0,
            totalTimeTracked: data.totalTimeTracked,
            averageTasksCompleted: data.tasksCompleted / data.count,
            averageTasksCreated: data.tasksCreated / data.count,
          });
        }
      }

      // Determine trend direction
      for (let i = 1; i < trendData.length; i++) {
        const current = trendData[i];
        const previous = trendData[i - 1];
        
        if (current.completionRate > previous.completionRate) {
          current.trend = 'increasing';
        } else if (current.completionRate < previous.completionRate) {
          current.trend = 'decreasing';
        } else {
          current.trend = 'stable';
        }
      }

      // Create trend data entity
      const trend = this.trendDataRepository.create({
        userId,
        startDate,
        endDate,
        period,
        data: trendData,
      });

      return await this.trendDataRepository.save(trend);
    } catch (error) {
      this.logger.error(`Error analyzing trends for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to analyze trends: ${error.message}`);
    }
  }

  /**
   * Get week number for a date
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Detect patterns in trend data
   */
  async detectPatterns(trendData: TrendData[]): Promise<any[]> {
    try {
      const patterns: any[] = [];

      // Look for consistent increasing/decreasing trends
      let currentTrend: string | null = null;
      let trendCount = 0;
      let trendStart: Date | null = null;

      trendData.forEach((data, index) => {
        const trendDirection = this.getTrendDirection(data);

        if (trendDirection === currentTrend) {
          trendCount++;
        } else {
          // If we had a trend of at least 3 periods, record it
          if (currentTrend && trendCount >= 3) {
            patterns.push({
              type: 'consistent_trend',
              direction: currentTrend,
              start: trendStart,
              end: trendData[index - 1].createdAt,
              duration: trendCount,
            });
          }

          // Start new trend
          currentTrend = trendDirection;
          trendCount = 1;
          trendStart = data.createdAt;
        }
      });

      // Check for the last trend
      if (currentTrend && trendCount >= 3) {
        patterns.push({
          type: 'consistent_trend',
          direction: currentTrend,
          start: trendStart,
          end: trendData[trendData.length - 1].createdAt,
          duration: trendCount,
        });
      }

      return patterns;
    } catch (error) {
      this.logger.error(`Error detecting patterns: ${error.message}`);
      throw new ProductivityException(`Failed to detect patterns: ${error.message}`);
    }
  }

  /**
   * Get trend direction from trend data
   */
  private getTrendDirection(data: TrendData): string {
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const lastEntry = data.data[data.data.length - 1];
      return lastEntry.trend || 'stable';
    }
    return 'stable';
  }

  /**
   * Generate productivity insights
   */
  async generateInsights(userId: string): Promise<any[]> {
    try {
      const insights: any[] = [];

      // Get recent statistics
      const recentStats = await this.statisticRepository.find({
        where: {
          userId,
        },
        order: {
          date: 'DESC',
        },
        take: 30, // Last 30 days
      });

      if (recentStats.length === 0) {
        return insights;
      }

      // Calculate averages
      let totalCompletionRate = 0;
      let totalTasksCompleted = 0;
      let totalTasksCreated = 0;
      let totalOverdueTasks = 0;

      recentStats.forEach(stat => {
        totalCompletionRate += stat.completionRate;
        totalTasksCompleted += stat.tasksCompleted;
        totalTasksCreated += stat.tasksCreated;
        totalOverdueTasks += stat.overdueTasks;
      });

      const avgCompletionRate = totalCompletionRate / recentStats.length;
      const avgTasksCompleted = totalTasksCompleted / recentStats.length;
      const avgTasksCreated = totalTasksCreated / recentStats.length;
      const avgOverdueTasks = totalOverdueTasks / recentStats.length;

      // Generate insights based on averages
      if (avgCompletionRate < 0.5) {
        insights.push({
          type: 'low_completion_rate',
          message: 'Your task completion rate is below 50%. Consider breaking tasks into smaller steps.',
          severity: 'warning',
        });
      }

      if (avgOverdueTasks > avgTasksCreated * 0.3) {
        insights.push({
          type: 'high_overdue_rate',
          message: 'Over 30% of your tasks are overdue. Consider setting more realistic deadlines.',
          severity: 'warning',
        });
      }

      // Compare last week to current week
      if (recentStats.length >= 14) {
        const lastWeekStats = recentStats.slice(7, 14);
        const currentWeekStats = recentStats.slice(0, 7);

        let lastWeekCompletion = 0;
        let currentWeekCompletion = 0;

        lastWeekStats.forEach(stat => {
          lastWeekCompletion += stat.completionRate;
        });

        currentWeekStats.forEach(stat => {
          currentWeekCompletion += stat.completionRate;
        });

        const lastWeekAvg = lastWeekCompletion / lastWeekStats.length;
        const currentWeekAvg = currentWeekCompletion / currentWeekStats.length;

        if (currentWeekAvg > lastWeekAvg * 1.1) {
          insights.push({
            type: 'improving_trend',
            message: 'Great job! Your completion rate has improved by 10% compared to last week.',
            severity: 'positive',
          });
        } else if (currentWeekAvg < lastWeekAvg * 0.9) {
          insights.push({
            type: 'declining_trend',
            message: 'Your completion rate has declined by 10% compared to last week. Identify obstacles.',
            severity: 'warning',
          });
        }
      }

      return insights;
    } catch (error) {
      this.logger.error(`Error generating insights for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to generate insights: ${error.message}`);
    }
  }

  /**
   * Get trend data by period
   */
  async getTrendDataByPeriod(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date,
  ): Promise<TrendData[]> {
    try {
      return await this.trendDataRepository.find({
        where: {
          userId,
          period,
          startDate,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`Error retrieving trend data: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve trend data: ${error.message}`);
    }
  }
}