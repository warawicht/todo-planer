import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';

export interface CollaborationAuditLog {
  id?: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

@Injectable()
export class CollaborationAuditService {
  private readonly logger = new Logger(CollaborationAuditService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Log a collaboration action for audit purposes
   * @param log The audit log entry to record
   */
  async logAction(log: CollaborationAuditLog): Promise<void> {
    try {
      // In a production environment, this would save to a dedicated audit log database
      // For now, we'll log to the application logger
      this.logger.log({
        message: 'Collaboration action logged',
        userId: log.userId,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
        details: log.details,
      });

      // Here you would typically save to a dedicated audit log database
      // await this.auditLogRepository.save(log);
    } catch (error) {
      this.logger.error(`Failed to log collaboration action: ${error.message}`, error.stack);
    }
  }

  /**
   * Log a task sharing action
   * @param userId The ID of the user performing the action
   * @param taskId The ID of the task being shared
   * @param sharedWithId The ID of the user the task is being shared with
   * @param permissionLevel The permission level being granted
   * @param ipAddress The IP address of the request
   * @param userAgent The user agent of the request
   */
  async logTaskShare(
    userId: string,
    taskId: string,
    sharedWithId: string,
    permissionLevel: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction({
      userId,
      action: 'TASK_SHARE',
      resourceType: 'task',
      resourceId: taskId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      details: {
        sharedWithId,
        permissionLevel,
      },
    });
  }

  /**
   * Log a task assignment action
   * @param userId The ID of the user performing the action
   * @param taskId The ID of the task being assigned
   * @param assignedToId The ID of the user the task is being assigned to
   * @param ipAddress The IP address of the request
   * @param userAgent The user agent of the request
   */
  async logTaskAssignment(
    userId: string,
    taskId: string,
    assignedToId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction({
      userId,
      action: 'TASK_ASSIGN',
      resourceType: 'task',
      resourceId: taskId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      details: {
        assignedToId,
      },
    });
  }

  /**
   * Log a comment action
   * @param userId The ID of the user performing the action
   * @param commentId The ID of the comment
   * @param taskId The ID of the task the comment belongs to
   * @param action The action being performed (CREATE, UPDATE, DELETE)
   * @param ipAddress The IP address of the request
   * @param userAgent The user agent of the request
   */
  async logCommentAction(
    userId: string,
    commentId: string,
    taskId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction({
      userId,
      action: `COMMENT_${action}`,
      resourceType: 'comment',
      resourceId: commentId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      details: {
        taskId,
      },
    });
  }

  /**
   * Log an availability update action
   * @param userId The ID of the user performing the action
   * @param availabilityId The ID of the availability record
   * @param action The action being performed (CREATE, UPDATE, DELETE)
   * @param ipAddress The IP address of the request
   * @param userAgent The user agent of the request
   */
  async logAvailabilityAction(
    userId: string,
    availabilityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction({
      userId,
      action: `AVAILABILITY_${action}`,
      resourceType: 'availability',
      resourceId: availabilityId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Log a calendar access action
   * @param userId The ID of the user performing the action
   * @param action The action being performed (VIEW_TEAM_CALENDAR, VIEW_USER_CALENDAR)
   * @param ipAddress The IP address of the request
   * @param userAgent The user agent of the request
   */
  async logCalendarAccess(
    userId: string,
    action: 'VIEW_TEAM_CALENDAR' | 'VIEW_USER_CALENDAR',
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction({
      userId,
      action,
      resourceType: 'calendar',
      resourceId: userId, // Using userId as resourceId for calendar actions
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Get audit logs for a specific user
   * @param userId The ID of the user to get logs for
   * @param limit The maximum number of logs to return
   * @param offset The offset for pagination
   */
  async getUserAuditLogs(userId: string, limit: number = 50, offset: number = 0): Promise<CollaborationAuditLog[]> {
    // In a production environment, this would query the audit log database
    // For now, we'll return an empty array as we're only logging to the application logger
    this.logger.debug(`Getting audit logs for user ${userId} with limit ${limit} and offset ${offset}`);
    return [];
  }

  /**
   * Get audit logs for a specific resource
   * @param resourceType The type of resource
   * @param resourceId The ID of the resource
   * @param limit The maximum number of logs to return
   * @param offset The offset for pagination
   */
  async getResourceAuditLogs(
    resourceType: string,
    resourceId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<CollaborationAuditLog[]> {
    // In a production environment, this would query the audit log database
    // For now, we'll return an empty array as we're only logging to the application logger
    this.logger.debug(
      `Getting audit logs for resource ${resourceType}:${resourceId} with limit ${limit} and offset ${offset}`,
    );
    return [];
  }
}