import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insight, InsightType } from '../entities/insight.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';
import { ProductivityStatistic } from '../entities/productivity-statistic.entity';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    @InjectRepository(Insight)
    private readonly insightRepository: Repository<Insight>,
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(ProductivityStatistic)
    private readonly statisticRepository: Repository<ProductivityStatistic>,
  ) {}

  /**
   * Generate productivity insights for a user
   */
  async generateInsights(userId: string, startDate?: Date, endDate?: Date): Promise<Insight[]> {
    try {
      // Get productivity data for analysis
      let query = this.statisticRepository.createQueryBuilder('statistic')
        .where('statistic.userId = :userId', { userId });

      if (startDate) {
        query = query.andWhere('statistic.date >= :startDate', { startDate });
      }

      if (endDate) {
        query = query.andWhere('statistic.date <= :endDate', { endDate });
      }

      const statistics = await query.orderBy('statistic.date', 'ASC').getMany();

      // Generate insights based on data patterns
      const insights: Partial<Insight>[] = [];

      // Analyze completion rate trends
      if (statistics.length > 1) {
        const firstWeekRate = statistics[0].completionRate;
        const lastWeekRate = statistics[statistics.length - 1].completionRate;
        
        if (lastWeekRate > firstWeekRate * 1.2) {
          insights.push({
            userId,
            type: 'improving_trend',
            message: 'Your task completion rate has improved by ' + 
              Math.round((lastWeekRate / firstWeekRate - 1) * 100) + '% over the selected period.',
            severity: 3,
            isActionable: true,
            recommendation: 'Keep up the good work! Consider maintaining your current productivity habits.'
          });
        } else if (lastWeekRate < firstWeekRate * 0.8) {
          insights.push({
            userId,
            type: 'declining_trend',
            message: 'Your task completion rate has declined by ' + 
              Math.round((1 - lastWeekRate / firstWeekRate) * 100) + '% over the selected period.',
            severity: 4,
            isActionable: true,
            recommendation: 'Review your task priorities and time allocation. Consider breaking large tasks into smaller ones.'
          });
        }
      }

      // Analyze time tracking patterns
      const timeEntries = await this.timeEntryRepository.find({
        where: { userId },
        order: { startTime: 'DESC' },
        take: 30 // Last 30 entries
      });

      if (timeEntries.length > 5) {
        // Calculate average session duration
        let totalDuration = 0;
        let validEntries = 0;
        
        timeEntries.forEach(entry => {
          if (entry.duration && entry.duration > 0) {
            totalDuration += entry.duration;
            validEntries++;
          }
        });

        if (validEntries > 0) {
          const avgDuration = totalDuration / validEntries;
          
          if (avgDuration > 3600 * 2) { // More than 2 hours
            insights.push({
              userId,
              type: 'pattern_identified',
              message: 'You typically work in long focused sessions (average ' + 
                Math.round(avgDuration / 60) + ' minutes).',
              severity: 2,
              isActionable: true,
              recommendation: 'Consider taking regular breaks to maintain focus and prevent burnout.'
            });
          } else if (avgDuration < 3600 * 0.5) { // Less than 30 minutes
            insights.push({
              userId,
              type: 'pattern_identified',
              message: 'You typically work in short sessions (average ' + 
                Math.round(avgDuration / 60) + ' minutes).',
              severity: 2,
              isActionable: true,
              recommendation: 'Try grouping similar tasks together to improve focus and efficiency.'
            });
          }
        }
      }

      // Analyze task completion patterns
      const recentTasks = await this.taskRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 20
      });

      if (recentTasks.length > 5) {
        const completedTasks = recentTasks.filter(task => task.status === 'completed');
        const completionRate = completedTasks.length / recentTasks.length;
        
        if (completionRate > 0.8) {
          insights.push({
            userId,
            type: 'recommendation',
            message: 'You have a high task completion rate (' + Math.round(completionRate * 100) + '%).',
            severity: 3,
            isActionable: true,
            recommendation: 'Consider challenging yourself with more complex tasks or setting higher goals.'
          });
        } else if (completionRate < 0.5) {
          insights.push({
            userId,
            type: 'recommendation',
            message: 'Your task completion rate is relatively low (' + Math.round(completionRate * 100) + '%).',
            severity: 4,
            isActionable: true,
            recommendation: 'Review your task estimation and prioritization. Focus on completing fewer, higher-priority tasks.'
          });
        }
      }

      // Save insights to database
      const savedInsights: Insight[] = [];
      for (const insightData of insights) {
        const insight = this.insightRepository.create(insightData);
        const savedInsight = await this.insightRepository.save(insight);
        savedInsights.push(savedInsight);
      }

      return savedInsights;
    } catch (error) {
      this.logger.error(`Error generating insights for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to generate insights: ${error.message}`);
    }
  }

  /**
   * Get user's productivity insights
   */
  async getUserInsights(userId: string): Promise<Insight[]> {
    try {
      return await this.insightRepository.find({
        where: { userId, isDismissed: false },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error retrieving insights for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve insights: ${error.message}`);
    }
  }

  /**
   * Dismiss a specific insight
   */
  async dismissInsight(insightId: string, userId: string): Promise<Insight> {
    try {
      const insight = await this.insightRepository.findOne({
        where: { id: insightId, userId },
      });

      if (!insight) {
        throw new ProductivityException('Insight not found or does not belong to user');
      }

      insight.isDismissed = true;
      return await this.insightRepository.save(insight);
    } catch (error) {
      this.logger.error(`Error dismissing insight ${insightId}: ${error.message}`);
      throw new ProductivityException(`Failed to dismiss insight: ${error.message}`);
    }
  }
}