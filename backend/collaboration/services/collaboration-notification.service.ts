import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NotificationService } from '../../notifications/services/notification.service';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { InputSanitizationService } from './input-sanitization.service';

@Injectable()
export class CollaborationNotificationService {
  private readonly logger = new Logger(CollaborationNotificationService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly inputSanitizationService: InputSanitizationService,
  ) {}

  async sendTaskSharedNotification(
    userId: string,
    taskId: string,
    sharedByUserId: string,
    permissionLevel: string,
  ): Promise<void> {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedTaskId = this.inputSanitizationService.sanitizeUuid(taskId);
    const sanitizedSharedByUserId = this.inputSanitizationService.sanitizeUuid(sharedByUserId);
    const sanitizedPermissionLevel = this.inputSanitizationService.sanitizePermissionLevel(permissionLevel);

    if (!sanitizedUserId || !sanitizedTaskId || !sanitizedSharedByUserId || !sanitizedPermissionLevel) {
      throw new BadRequestException('Invalid input parameters');
    }

    await this.retryOnNetworkFailure(async () => {
      const notificationDto: CreateNotificationDto = {
        title: 'Task Shared',
        message: `A task has been shared with you with ${sanitizedPermissionLevel} permissions`,
        type: 'system_alert',
        channel: 'in_app',
        priority: 2,
        relatedEntityId: sanitizedTaskId,
        relatedEntityType: 'task',
      };

      await this.notificationService.create(notificationDto, sanitizedUserId);
    });
  }

  async sendTaskAssignedNotification(
    userId: string,
    taskId: string,
    assignedByUserId: string,
  ): Promise<void> {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedTaskId = this.inputSanitizationService.sanitizeUuid(taskId);
    const sanitizedAssignedByUserId = this.inputSanitizationService.sanitizeUuid(assignedByUserId);

    if (!sanitizedUserId || !sanitizedTaskId || !sanitizedAssignedByUserId) {
      throw new BadRequestException('Invalid input parameters');
    }

    await this.retryOnNetworkFailure(async () => {
      const notificationDto: CreateNotificationDto = {
        title: 'Task Assigned',
        message: 'A task has been assigned to you',
        type: 'system_alert',
        channel: 'in_app',
        priority: 3,
        relatedEntityId: sanitizedTaskId,
        relatedEntityType: 'task',
      };

      await this.notificationService.create(notificationDto, sanitizedUserId);
    });
  }

  async sendTaskCommentNotification(
    userId: string,
    taskId: string,
    commentId: string,
    commentedByUserId: string,
  ): Promise<void> {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedTaskId = this.inputSanitizationService.sanitizeUuid(taskId);
    const sanitizedCommentId = this.inputSanitizationService.sanitizeUuid(commentId);
    const sanitizedCommentedByUserId = this.inputSanitizationService.sanitizeUuid(commentedByUserId);

    if (!sanitizedUserId || !sanitizedTaskId || !sanitizedCommentId || !sanitizedCommentedByUserId) {
      throw new BadRequestException('Invalid input parameters');
    }

    await this.retryOnNetworkFailure(async () => {
      const notificationDto: CreateNotificationDto = {
        title: 'New Comment',
        message: 'A new comment was added to a task you are involved in',
        type: 'system_alert',
        channel: 'in_app',
        priority: 2,
        relatedEntityId: sanitizedTaskId,
        relatedEntityType: 'task',
      };

      await this.notificationService.create(notificationDto, sanitizedUserId);
    });
  }

  async sendAvailabilityUpdatedNotification(
    userId: string,
    availabilityId: string,
  ): Promise<void> {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedAvailabilityId = this.inputSanitizationService.sanitizeUuid(availabilityId);

    if (!sanitizedUserId || !sanitizedAvailabilityId) {
      throw new BadRequestException('Invalid input parameters');
    }

    await this.retryOnNetworkFailure(async () => {
      const notificationDto: CreateNotificationDto = {
        title: 'Availability Updated',
        message: 'A team member has updated their availability',
        type: 'system_alert',
        channel: 'in_app',
        priority: 1,
        relatedEntityId: sanitizedAvailabilityId,
        relatedEntityType: 'task',
      };

      await this.notificationService.create(notificationDto, sanitizedUserId);
    });
  }

  /**
   * Retry mechanism for handling network failures
   * @param operation The operation to retry
   * @param maxRetries Maximum number of retries (default: 3)
   * @param delay Delay between retries in milliseconds (default: 1000)
   */
  private async retryOnNetworkFailure<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        // If this is the last attempt, rethrow the error
        if (attempt === maxRetries) {
          this.logger.error(`All ${maxRetries} attempts failed. Last error: ${error.message}`);
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw lastError;
  }
}