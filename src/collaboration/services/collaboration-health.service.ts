import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { TaskShare } from '../task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../task-assignment/entities/task-assignment.entity';
import { TaskComment } from '../comments/entities/task-comment.entity';
import { UserAvailability } from '../availability/entities/user-availability.entity';
import { CollaborationCacheService } from './collaboration-cache.service';
import { RateLimitingService } from './rate-limiting.service';

@Injectable()
export class CollaborationHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(CollaborationHealthIndicator.name);

  constructor(
    @InjectRepository(TaskShare)
    private taskShareRepository: Repository<TaskShare>,
    @InjectRepository(TaskAssignment)
    private taskAssignmentRepository: Repository<TaskAssignment>,
    @InjectRepository(TaskComment)
    private taskCommentRepository: Repository<TaskComment>,
    @InjectRepository(UserAvailability)
    private userAvailabilityRepository: Repository<UserAvailability>,
    private readonly collaborationCacheService: CollaborationCacheService,
    private readonly rateLimitingService: RateLimitingService,
  ) {
    super();
  }

  /**
   * Check the health of collaboration services
   */
  async checkCollaborationHealth(key: string = 'collaboration'): Promise<HealthIndicatorResult> {
    const detailedInfo: Record<string, any> = {};

    try {
      // Check database connectivity by counting records in each table
      const taskShareCount = await this.taskShareRepository.count();
      detailedInfo.taskShares = taskShareCount;

      const taskAssignmentCount = await this.taskAssignmentRepository.count();
      detailedInfo.taskAssignments = taskAssignmentCount;

      const taskCommentCount = await this.taskCommentRepository.count();
      detailedInfo.taskComments = taskCommentCount;

      const userAvailabilityCount = await this.userAvailabilityRepository.count();
      detailedInfo.userAvailabilities = userAvailabilityCount;

      // Check cache service health
      const cacheHealth = await this.checkCacheHealth();
      detailedInfo.cache = cacheHealth;

      // Check rate limiting service health
      const rateLimitingHealth = await this.checkRateLimitingHealth();
      detailedInfo.rateLimiting = rateLimitingHealth;

      // If we reach this point, all checks passed
      return this.getStatus(key, true, detailedInfo);
    } catch (error) {
      this.logger.error(`Collaboration health check failed: ${error.message}`, error.stack);
      throw new HealthCheckError('Collaboration health check failed', this.getStatus(key, false, detailedInfo));
    }
  }

  /**
   * Check the health of the cache service
   */
  private async checkCacheHealth(): Promise<{ status: string; details?: string }> {
    try {
      // Test cache by setting and getting a value
      const testKey = 'health_check_test';
      const testValue = 'test_value';
      
      await this.collaborationCacheService.set(testKey, testValue, 10); // 10 seconds TTL
      const retrievedValue = await this.collaborationCacheService.get(testKey);
      
      if (retrievedValue === testValue) {
        // Clean up the test key
        await this.collaborationCacheService.del(testKey);
        return { status: 'healthy' };
      } else {
        return { status: 'unhealthy', details: 'Cache value mismatch' };
      }
    } catch (error) {
      this.logger.error(`Cache health check failed: ${error.message}`, error.stack);
      return { status: 'unhealthy', details: error.message };
    }
  }

  /**
   * Check the health of the rate limiting service
   */
  private async checkRateLimitingHealth(): Promise<{ status: string; details?: string }> {
    try {
      // Test rate limiting by checking a test key
      const testKey = 'health_check_test';
      const limitInfo = await this.rateLimitingService.getRateLimitInfo(testKey, 'healthCheck');
      
      // If we can get limit info without error, the service is healthy
      return { status: 'healthy' };
    } catch (error) {
      this.logger.error(`Rate limiting health check failed: ${error.message}`, error.stack);
      return { status: 'unhealthy', details: error.message };
    }
  }

  /**
   * Get performance metrics for collaboration services
   */
  async getCollaborationMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};

    try {
      // Get counts of various collaboration entities
      metrics.taskShares = await this.taskShareRepository.count();
      metrics.taskAssignments = await this.taskAssignmentRepository.count();
      metrics.taskComments = await this.taskCommentRepository.count();
      metrics.userAvailabilities = await this.userAvailabilityRepository.count();

      // Get cache statistics
      metrics.cacheStats = await this.collaborationCacheService.getStats();

      // Get rate limiting statistics
      metrics.rateLimitingStats = await this.rateLimitingService.getStats();

      // Calculate some derived metrics
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      metrics.recentTaskShares = await this.taskShareRepository.count({
        where: {
          createdAt: MoreThan(oneWeekAgo),
        },
      });

      metrics.recentTaskAssignments = await this.taskAssignmentRepository.count({
        where: {
          createdAt: MoreThan(oneWeekAgo),
        },
      });

      metrics.recentTaskComments = await this.taskCommentRepository.count({
        where: {
          createdAt: MoreThan(oneWeekAgo),
        },
      });

      return metrics;
    } catch (error) {
      this.logger.error(`Failed to get collaboration metrics: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  /**
   * Check for any potential issues in collaboration data
   */
  async checkForIssues(): Promise<Record<string, any>> {
    const issues: Record<string, any> = {};

    try {
      // Check for orphaned task shares (shares for non-existent tasks)
      const orphanedShares = await this.taskShareRepository
        .createQueryBuilder('share')
        .leftJoinAndSelect('share.task', 'task')
        .where('task.id IS NULL')
        .getCount();
      
      if (orphanedShares > 0) {
        issues.orphanedTaskShares = orphanedShares;
      }

      // Check for orphaned task assignments (assignments for non-existent tasks)
      const orphanedAssignments = await this.taskAssignmentRepository
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.task', 'task')
        .where('task.id IS NULL')
        .getCount();
      
      if (orphanedAssignments > 0) {
        issues.orphanedTaskAssignments = orphanedAssignments;
      }

      // Check for orphaned comments (comments for non-existent tasks)
      const orphanedComments = await this.taskCommentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.task', 'task')
        .where('task.id IS NULL')
        .getCount();
      
      if (orphanedComments > 0) {
        issues.orphanedComments = orphanedComments;
      }

      // Check for revoked shares that are still marked as accepted
      const revokedAcceptedShares = await this.taskShareRepository.count({
        where: {
          isRevoked: true,
          isAccepted: true,
        },
      });
      
      if (revokedAcceptedShares > 0) {
        issues.revokedAcceptedShares = revokedAcceptedShares;
      }

      // Check for assignments with invalid statuses
      const invalidStatusAssignments = await this.taskAssignmentRepository
        .createQueryBuilder('assignment')
        .where('assignment.status NOT IN (:...validStatuses)', {
          validStatuses: ['pending', 'accepted', 'rejected', 'completed'],
        })
        .getCount();
      
      if (invalidStatusAssignments > 0) {
        issues.invalidStatusAssignments = invalidStatusAssignments;
      }

      return issues;
    } catch (error) {
      this.logger.error(`Failed to check for collaboration issues: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }
}