import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { TaskComment } from '../comments/entities/task-comment.entity';
import { TaskAttachment } from '../../tasks/entities/attachments/task-attachment.entity';

export interface StorageLimits {
  maxCommentLength: number;
  maxCommentsPerTask: number;
  maxAttachmentSize: number; // in bytes
  maxAttachmentsPerTask: number;
  maxTotalStoragePerUser: number; // in bytes
}

@Injectable()
export class StorageLimitationService {
  private readonly logger = new Logger(StorageLimitationService.name);
  
  // Default storage limits
  private readonly defaultLimits: StorageLimits = {
    maxCommentLength: 2000, // 2KB per comment
    maxCommentsPerTask: 100,
    maxAttachmentSize: 10 * 1024 * 1024, // 10MB per attachment
    maxAttachmentsPerTask: 10,
    maxTotalStoragePerUser: 100 * 1024 * 1024 // 100MB per user
  };

  /**
   * Validate comment content length
   * @param content The comment content
   * @throws ForbiddenException if content exceeds limit
   */
  validateCommentLength(content: string): void {
    if (content.length > this.defaultLimits.maxCommentLength) {
      throw new ForbiddenException(
        `Comment content exceeds maximum length of ${this.defaultLimits.maxCommentLength} characters`
      );
    }
  }

  /**
   * Validate number of comments per task
   * @param currentCount Current number of comments for the task
   * @throws ForbiddenException if limit would be exceeded
   */
  validateCommentsPerTask(currentCount: number): void {
    if (currentCount >= this.defaultLimits.maxCommentsPerTask) {
      throw new ForbiddenException(
        `Maximum number of comments per task (${this.defaultLimits.maxCommentsPerTask}) exceeded`
      );
    }
  }

  /**
   * Validate attachment file size
   * @param fileSize The file size in bytes
   * @throws ForbiddenException if file size exceeds limit
   */
  validateAttachmentSize(fileSize: number): void {
    if (fileSize > this.defaultLimits.maxAttachmentSize) {
      throw new ForbiddenException(
        `Attachment size ${fileSize} bytes exceeds maximum allowed size of ${this.defaultLimits.maxAttachmentSize} bytes`
      );
    }
  }

  /**
   * Validate number of attachments per task
   * @param currentCount Current number of attachments for the task
   * @throws ForbiddenException if limit would be exceeded
   */
  validateAttachmentsPerTask(currentCount: number): void {
    if (currentCount >= this.defaultLimits.maxAttachmentsPerTask) {
      throw new ForbiddenException(
        `Maximum number of attachments per task (${this.defaultLimits.maxAttachmentsPerTask}) exceeded`
      );
    }
  }

  /**
   * Validate total storage usage per user
   * @param currentUsage Current storage usage in bytes
   * @param additionalSize Additional size that would be added
   * @throws ForbiddenException if storage limit would be exceeded
   */
  validateTotalStoragePerUser(currentUsage: number, additionalSize: number): void {
    if (currentUsage + additionalSize > this.defaultLimits.maxTotalStoragePerUser) {
      throw new ForbiddenException(
        `User storage limit of ${this.defaultLimits.maxTotalStoragePerUser} bytes would be exceeded`
      );
    }
  }

  /**
   * Get current storage usage for a user
   * @param userId The user ID
   * @param comments The user's comments
   * @param attachments The user's attachments
   * @returns The total storage usage in bytes
   */
  calculateUserStorageUsage(userId: string, comments: TaskComment[], attachments: TaskAttachment[]): number {
    // Calculate comment storage (approximate)
    const commentStorage = comments.reduce((total, comment) => {
      return total + (comment.content?.length || 0);
    }, 0);

    // Calculate attachment storage
    const attachmentStorage = attachments.reduce((total, attachment) => {
      return total + (attachment.fileSize || 0);
    }, 0);

    const totalStorage = commentStorage + attachmentStorage;
    this.logger.debug(`User ${userId} storage usage: ${totalStorage} bytes (${commentStorage} comments, ${attachmentStorage} attachments)`);

    return totalStorage;
  }

  /**
   * Get storage limits
   * @returns The storage limits
   */
  getStorageLimits(): StorageLimits {
    return { ...this.defaultLimits };
  }
}