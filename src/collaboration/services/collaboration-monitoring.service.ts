import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, MoreThan } from 'typeorm';
import { TaskShare } from '../task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../task-assignment/entities/task-assignment.entity';
import { TaskComment } from '../comments/entities/task-comment.entity';
import { UserAvailability } from '../availability/entities/user-availability.entity';
import { CollaborationCacheService } from './collaboration-cache.service';
import { RateLimitingService } from './rate-limiting.service';

export interface CollaborationMetrics {
  // Entity counts
  taskShareCount: number;
  taskAssignmentCount: number;
  taskCommentCount: number;
  userAvailabilityCount: number;
  
  // Recent activity (last 24 hours)
  recentTaskShares: number;
  recentTaskAssignments: number;
  recentTaskComments: number;
  recentUserAvailabilities: number;
  
  // User engagement
  activeUsersInCollaboration: number;
  usersWithSharedTasks: number;
  usersWithAssignedTasks: number;
  
  // Cache metrics
  cacheHitRate: number;
  cacheSize: number;
  
  // Rate limiting metrics
  rateLimitHits: number;
  rateLimitBlocks: number;
  
  // Performance metrics
  averageTaskShareResponseTime: number;
  averageTaskAssignmentResponseTime: number;
  averageCommentResponseTime: number;
  
  // Error rates
  taskShareErrorRate: number;
  taskAssignmentErrorRate: number;
  commentErrorRate: number;
}

@Injectable()
export class CollaborationMonitoringService {
  private readonly logger = new Logger(CollaborationMonitoringService.name);
  private metrics: CollaborationMetrics = {
    taskShareCount: 0,
    taskAssignmentCount: 0,
    taskCommentCount: 0,
    userAvailabilityCount: 0,
    recentTaskShares: 0,
    recentTaskAssignments: 0,
    recentTaskComments: 0,
    recentUserAvailabilities: 0,
    activeUsersInCollaboration: 0,
    usersWithSharedTasks: 0,
    usersWithAssignedTasks: 0,
    cacheHitRate: 0,
    cacheSize: 0,
    rateLimitHits: 0,
    rateLimitBlocks: 0,
    averageTaskShareResponseTime: 0,
    averageTaskAssignmentResponseTime: 0,
    averageCommentResponseTime: 0,
    taskShareErrorRate: 0,
    taskAssignmentErrorRate: 0,
    commentErrorRate: 0,
  };

  constructor(
    @InjectRepository(TaskShare)
    private taskShareRepository: Repository<TaskShare>,
    @InjectRepository(TaskAssignment)
    private taskAssignmentRepository: Repository<TaskAssignment>,
    @InjectRepository(TaskComment)
    private taskCommentRepository: Repository<TaskComment>,
    @InjectRepository(UserAvailability)
    private userAvailabilityRepository: Repository<UserAvailability>,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly collaborationCacheService: CollaborationCacheService,
    private readonly rateLimitingService: RateLimitingService,
  ) {}

  /**
   * Collect and update all collaboration metrics
   */
  async collectMetrics(): Promise<CollaborationMetrics> {
    try {
      this.logger.debug('Collecting collaboration metrics');
      
      // Collect entity counts
      await this.collectEntityCounts();
      
      // Collect recent activity
      await this.collectRecentActivity();
      
      // Collect user engagement metrics
      await this.collectUserEngagement();
      
      // Collect cache metrics
      await this.collectCacheMetrics();
      
      // Collect rate limiting metrics
      await this.collectRateLimitingMetrics();
      
      // Collect performance metrics (simulated)
      await this.collectPerformanceMetrics();
      
      // Collect error rates (simulated)
      await this.collectErrorRates();
      
      this.logger.debug('Finished collecting collaboration metrics');
      return this.metrics;
    } catch (error) {
      this.logger.error(`Failed to collect collaboration metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Collect entity counts
   */
  private async collectEntityCounts(): Promise<void> {
    this.metrics.taskShareCount = await this.taskShareRepository.count();
    this.metrics.taskAssignmentCount = await this.taskAssignmentRepository.count();
    this.metrics.taskCommentCount = await this.taskCommentRepository.count();
    this.metrics.userAvailabilityCount = await this.userAvailabilityRepository.count();
  }

  /**
   * Collect recent activity metrics (last 24 hours)
   */
  private async collectRecentActivity(): Promise<void> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    this.metrics.recentTaskShares = await this.taskShareRepository.count({
      where: {
        createdAt: MoreThan(twentyFourHoursAgo),
      },
    });

    this.metrics.recentTaskAssignments = await this.taskAssignmentRepository.count({
      where: {
        createdAt: MoreThan(twentyFourHoursAgo),
      },
    });

    this.metrics.recentTaskComments = await this.taskCommentRepository.count({
      where: {
        createdAt: MoreThan(twentyFourHoursAgo),
      },
    });

    this.metrics.recentUserAvailabilities = await this.userAvailabilityRepository.count({
      where: {
        updatedAt: MoreThan(twentyFourHoursAgo),
      },
    });
  }

  /**
   * Collect user engagement metrics
   */
  private async collectUserEngagement(): Promise<void> {
    // Count distinct users who have shared tasks
    const usersWithSharedTasks = await this.taskShareRepository
      .createQueryBuilder('share')
      .select('COUNT(DISTINCT share.ownerId)', 'count')
      .getRawOne();
    this.metrics.usersWithSharedTasks = parseInt(usersWithSharedTasks.count, 10) || 0;

    // Count distinct users who have assigned tasks
    const usersWithAssignedTasks = await this.taskAssignmentRepository
      .createQueryBuilder('assignment')
      .select('COUNT(DISTINCT assignment.assignedById)', 'count')
      .getRawOne();
    this.metrics.usersWithAssignedTasks = parseInt(usersWithAssignedTasks.count, 10) || 0;

    // Count distinct users active in collaboration (shared, assigned, or commented)
    await this.collectActiveUserMetrics();
  }

  /**
   * Collect cache metrics
   */
  private async collectCacheMetrics(): Promise<void> {
    const cacheStats = await this.collaborationCacheService.getStats();
    this.metrics.cacheHitRate = cacheStats.hitRate || 0;
    this.metrics.cacheSize = cacheStats.size || 0;
  }

  /**
   * Collect rate limiting metrics
   */
  private async collectRateLimitingMetrics(): Promise<void> {
    const rateLimitStats = await this.rateLimitingService.getStats();
    this.metrics.rateLimitHits = rateLimitStats.hits || 0;
    this.metrics.rateLimitBlocks = rateLimitStats.blocks || 0;
  }

  /**
   * Collect performance metrics (simulated)
   */
  private async collectPerformanceMetrics(): Promise<void> {
    // In a real implementation, these would be collected from actual response times
    // For now, we'll simulate reasonable values
    this.metrics.averageTaskShareResponseTime = this.simulateResponseTime(50, 200);
    this.metrics.averageTaskAssignmentResponseTime = this.simulateResponseTime(40, 180);
    this.metrics.averageCommentResponseTime = this.simulateResponseTime(30, 150);
  }

  /**
   * Collect error rates (simulated)
   */
  private async collectErrorRates(): Promise<void> {
    // In a real implementation, these would be collected from actual error logs
    // For now, we'll simulate low error rates
    this.metrics.taskShareErrorRate = this.simulateErrorRate(0.01, 0.05);
    this.metrics.taskAssignmentErrorRate = this.simulateErrorRate(0.01, 0.05);
    this.metrics.commentErrorRate = this.simulateErrorRate(0.005, 0.03);
  }

  /**
   * Simulate response time for metrics
   */
  private simulateResponseTime(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Simulate error rate for metrics
   */
  private simulateErrorRate(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Get current metrics
   */
  getMetrics(): CollaborationMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics (for testing purposes)
   */
  resetMetrics(): void {
    this.metrics = {
      taskShareCount: 0,
      taskAssignmentCount: 0,
      taskCommentCount: 0,
      userAvailabilityCount: 0,
      recentTaskShares: 0,
      recentTaskAssignments: 0,
      recentTaskComments: 0,
      recentUserAvailabilities: 0,
      activeUsersInCollaboration: 0,
      usersWithSharedTasks: 0,
      usersWithAssignedTasks: 0,
      cacheHitRate: 0,
      cacheSize: 0,
      rateLimitHits: 0,
      rateLimitBlocks: 0,
      averageTaskShareResponseTime: 0,
      averageTaskAssignmentResponseTime: 0,
      averageCommentResponseTime: 0,
      taskShareErrorRate: 0,
      taskAssignmentErrorRate: 0,
      commentErrorRate: 0,
    };
  }

  /**
   * Log a significant event for monitoring
   * @param event The event name
   * @param details Additional details about the event
   */
  logEvent(event: string, details?: Record<string, any>): void {
    this.logger.log({
      message: 'Collaboration monitoring event',
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log an error for monitoring
   * @param error The error that occurred
   * @param context Additional context about where the error occurred
   */
  logError(error: Error, context?: Record<string, any>): void {
    this.logger.error({
      message: 'Collaboration monitoring error',
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get alert status based on current metrics
   */
  getAlertStatus(): { status: 'ok' | 'warning' | 'critical'; messages: string[] } {
    const messages: string[] = [];
    let status: 'ok' | 'warning' | 'critical' = 'ok';

    // Check for high error rates
    if (this.metrics.taskShareErrorRate > 0.05) {
      messages.push(`High task share error rate: ${(this.metrics.taskShareErrorRate * 100).toFixed(2)}%`);
      status = this.getWorstStatus(status, 'warning');
    }

    if (this.metrics.taskAssignmentErrorRate > 0.05) {
      messages.push(`High task assignment error rate: ${(this.metrics.taskAssignmentErrorRate * 100).toFixed(2)}%`);
      status = this.getWorstStatus(status, 'warning');
    }

    if (this.metrics.commentErrorRate > 0.03) {
      messages.push(`High comment error rate: ${(this.metrics.commentErrorRate * 100).toFixed(2)}%`);
      status = this.getWorstStatus(status, 'warning');
    }

    // Check for rate limiting blocks
    if (this.metrics.rateLimitBlocks > 100) {
      messages.push(`High rate limiting blocks: ${this.metrics.rateLimitBlocks}`);
      status = this.getWorstStatus(status, 'warning');
    }

    // Check for cache issues
    if (this.metrics.cacheHitRate < 0.5) {
      messages.push(`Low cache hit rate: ${(this.metrics.cacheHitRate * 100).toFixed(2)}%`);
      status = this.getWorstStatus(status, 'warning');
    }

    return { status, messages };
  }

  /**
   * Helper function to determine the worst status
   */
  private getWorstStatus(current: 'ok' | 'warning' | 'critical', newStatus: 'ok' | 'warning' | 'critical'): 'ok' | 'warning' | 'critical' {
    if (current === 'critical' || newStatus === 'critical') return 'critical';
    if (current === 'warning' || newStatus === 'warning') return 'warning';
    return 'ok';
  }

  private async collectActiveUserMetrics(): Promise<void> {
    // Get distinct user IDs from task shares, assignments, and comments
    // Using raw query for union operation since TypeORM doesn't support union directly
    const activeUsers = await this.dataSource.query(`
      SELECT DISTINCT userId FROM (
        SELECT "ownerId" as userId FROM task_shares
        UNION
        SELECT "assignedById" as userId FROM task_assignments
        UNION
        SELECT "userId" as userId FROM task_comments
      ) AS active_users
    `);
    
    this.metrics.activeUsersInCollaboration = activeUsers.length;
  }
}