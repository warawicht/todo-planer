import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TaskShare } from '../task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../task-assignment/entities/task-assignment.entity';
import { TaskComment } from '../comments/entities/task-comment.entity';
import { UserAvailability } from '../availability/entities/user-availability.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';
import { EncryptionService } from './encryption.service';

@Injectable()
export class CollaborationDataDeletionService {
  private readonly logger = new Logger(CollaborationDataDeletionService.name);

  constructor(
    @InjectRepository(TaskShare)
    private taskShareRepository: Repository&lt;TaskShare&gt;,
    @InjectRepository(TaskAssignment)
    private taskAssignmentRepository: Repository&lt;TaskAssignment&gt;,
    @InjectRepository(TaskComment)
    private taskCommentRepository: Repository&lt;TaskComment&gt;,
    @InjectRepository(UserAvailability)
    private userAvailabilityRepository: Repository&lt;UserAvailability&gt;,
    @InjectRepository(Task)
    private taskRepository: Repository&lt;Task&gt;,
    @InjectRepository(User)
    private userRepository: Repository&lt;User&gt;,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Securely delete all collaboration data for a user
   * @param userId The ID of the user whose collaboration data should be deleted
   */
  async deleteUserCollaborationData(userId: string): Promise&lt;void&gt; {
    try {
      this.logger.log(`Starting secure deletion of collaboration data for user ${userId}`);

      // Delete task shares where user is the owner
      const ownedTaskShares = await this.taskShareRepository.find({
        where: { ownerId: userId },
      });
      
      if (ownedTaskShares.length &gt; 0) {
        // Mark shares as revoked rather than deleting them to maintain data integrity
        for (const share of ownedTaskShares) {
          share.isRevoked = true;
          share.revokedAt = new Date();
          await this.taskShareRepository.save(share);
        }
        this.logger.log(`Revoked ${ownedTaskShares.length} task shares owned by user ${userId}`);
      }

      // Delete task shares where user is the recipient
      const receivedTaskShares = await this.taskShareRepository.find({
        where: { sharedWithId: userId },
      });
      
      if (receivedTaskShares.length &gt; 0) {
        // Mark shares as revoked rather than deleting them to maintain data integrity
        for (const share of receivedTaskShares) {
          share.isRevoked = true;
          share.revokedAt = new Date();
          await this.taskShareRepository.save(share);
        }
        this.logger.log(`Revoked ${receivedTaskShares.length} task shares received by user ${userId}`);
      }

      // Delete task assignments where user is the assigner
      const assignedTasks = await this.taskAssignmentRepository.find({
        where: { assignedById: userId },
      });
      
      if (assignedTasks.length &gt; 0) {
        await this.taskAssignmentRepository.remove(assignedTasks);
        this.logger.log(`Deleted ${assignedTasks.length} task assignments made by user ${userId}`);
      }

      // Delete task assignments where user is the assignee
      const receivedAssignments = await this.taskAssignmentRepository.find({
        where: { assignedToId: userId },
      });
      
      if (receivedAssignments.length &gt; 0) {
        await this.taskAssignmentRepository.remove(receivedAssignments);
        this.logger.log(`Deleted ${receivedAssignments.length} task assignments received by user ${userId}`);
      }

      // Delete user's comments
      const userComments = await this.taskCommentRepository.find({
        where: { userId },
      });
      
      if (userComments.length &gt; 0) {
        // First, delete all replies to these comments
        const commentIds = userComments.map(comment =&gt; comment.id);
        const replies = await this.taskCommentRepository.find({
          where: { parentId: In(commentIds) },
        });
        
        if (replies.length &gt; 0) {
          await this.taskCommentRepository.remove(replies);
          this.logger.log(`Deleted ${replies.length} replies to comments by user ${userId}`);
        }
        
        // Then delete the user's comments
        await this.taskCommentRepository.remove(userComments);
        this.logger.log(`Deleted ${userComments.length} comments by user ${userId}`);
      }

      // Delete user's availability records
      const userAvailabilities = await this.userAvailabilityRepository.find({
        where: { userId },
      });
      
      if (userAvailabilities.length &gt; 0) {
        await this.userAvailabilityRepository.remove(userAvailabilities);
        this.logger.log(`Deleted ${userAvailabilities.length} availability records for user ${userId}`);
      }

      this.logger.log(`Completed secure deletion of collaboration data for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete collaboration data for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Securely delete all collaboration data for a task
   * @param taskId The ID of the task whose collaboration data should be deleted
   */
  async deleteTaskCollaborationData(taskId: string): Promise&lt;void&gt; {
    try {
      this.logger.log(`Starting secure deletion of collaboration data for task ${taskId}`);

      // Verify task exists
      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      // Delete task shares
      const taskShares = await this.taskShareRepository.find({
        where: { taskId },
      });
      
      if (taskShares.length &gt; 0) {
        await this.taskShareRepository.remove(taskShares);
        this.logger.log(`Deleted ${taskShares.length} task shares for task ${taskId}`);
      }

      // Delete task assignments
      const taskAssignments = await this.taskAssignmentRepository.find({
        where: { taskId },
      });
      
      if (taskAssignments.length &gt; 0) {
        await this.taskAssignmentRepository.remove(taskAssignments);
        this.logger.log(`Deleted ${taskAssignments.length} task assignments for task ${taskId}`);
      }

      // Delete task comments
      const taskComments = await this.taskCommentRepository.find({
        where: { taskId },
      });
      
      if (taskComments.length &gt; 0) {
        await this.taskCommentRepository.remove(taskComments);
        this.logger.log(`Deleted ${taskComments.length} comments for task ${taskId}`);
      }

      this.logger.log(`Completed secure deletion of collaboration data for task ${taskId}`);
    } catch (error) {
      this.logger.error(`Failed to delete collaboration data for task ${taskId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Securely delete a specific task share
   * @param shareId The ID of the task share to delete
   * @param userId The ID of the user requesting the deletion (for permission check)
   */
  async deleteTaskShare(shareId: string, userId: string): Promise&lt;void&gt; {
    try {
      this.logger.log(`Starting secure deletion of task share ${shareId} by user ${userId}`);

      const taskShare = await this.taskShareRepository.findOne({
        where: { id: shareId },
        relations: ['task'],
      });

      if (!taskShare) {
        throw new NotFoundException(`Task share with ID ${shareId} not found`);
      }

      // Check if user has permission to delete this share
      // Either the owner of the task or the user the task was shared with can delete
      if (taskShare.ownerId !== userId &amp;&amp; taskShare.sharedWithId !== userId) {
        throw new Error(`User ${userId} does not have permission to delete task share ${shareId}`);
      }

      // Mark as revoked rather than deleting to maintain data integrity
      taskShare.isRevoked = true;
      taskShare.revokedAt = new Date();
      await this.taskShareRepository.save(taskShare);

      this.logger.log(`Revoked task share ${shareId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete task share ${shareId} by user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Securely delete a specific task assignment
   * @param assignmentId The ID of the task assignment to delete
   * @param userId The ID of the user requesting the deletion (for permission check)
   */
  async deleteTaskAssignment(assignmentId: string, userId: string): Promise&lt;void&gt; {
    try {
      this.logger.log(`Starting secure deletion of task assignment ${assignmentId} by user ${userId}`);

      const taskAssignment = await this.taskAssignmentRepository.findOne({
        where: { id: assignmentId },
      });

      if (!taskAssignment) {
        throw new NotFoundException(`Task assignment with ID ${assignmentId} not found`);
      }

      // Check if user has permission to delete this assignment
      // Only the assigner can delete
      if (taskAssignment.assignedById !== userId) {
        throw new Error(`User ${userId} does not have permission to delete task assignment ${assignmentId}`);
      }

      await this.taskAssignmentRepository.remove(taskAssignment);

      this.logger.log(`Deleted task assignment ${assignmentId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete task assignment ${assignmentId} by user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Securely delete a specific comment
   * @param commentId The ID of the comment to delete
   * @param userId The ID of the user requesting the deletion (for permission check)
   */
  async deleteComment(commentId: string, userId: string): Promise&lt;void&gt; {
    try {
      this.logger.log(`Starting secure deletion of comment ${commentId} by user ${userId}`);

      const comment = await this.taskCommentRepository.findOne({
        where: { id: commentId },
        relations: ['task'],
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      // Check if user has permission to delete this comment
      // Either the comment author or the task owner can delete
      if (comment.userId !== userId &amp;&amp; comment.task.userId !== userId) {
        throw new Error(`User ${userId} does not have permission to delete comment ${commentId}`);
      }

      // First delete all replies to this comment
      const replies = await this.taskCommentRepository.find({
        where: { parentId: commentId },
      });
      
      if (replies.length &gt; 0) {
        await this.taskCommentRepository.remove(replies);
        this.logger.log(`Deleted ${replies.length} replies to comment ${commentId}`);
      }

      // Then delete the comment itself
      await this.taskCommentRepository.remove(comment);

      this.logger.log(`Deleted comment ${commentId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete comment ${commentId} by user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Securely delete a user's availability records
   * @param userId The ID of the user whose availability records should be deleted
   * @param availabilityId Optional ID of a specific availability record to delete
   */
  async deleteUserAvailability(userId: string, availabilityId?: string): Promise&lt;void&gt; {
    try {
      if (availabilityId) {
        this.logger.log(`Starting secure deletion of availability record ${availabilityId} for user ${userId}`);
        
        const availability = await this.userAvailabilityRepository.findOne({
          where: { id: availabilityId, userId },
        });

        if (!availability) {
          throw new NotFoundException(`Availability record with ID ${availabilityId} not found for user ${userId}`);
        }

        await this.userAvailabilityRepository.remove(availability);
        this.logger.log(`Deleted availability record ${availabilityId} for user ${userId}`);
      } else {
        this.logger.log(`Starting secure deletion of all availability records for user ${userId}`);
        
        const availabilities = await this.userAvailabilityRepository.find({
          where: { userId },
        });
        
        if (availabilities.length &gt; 0) {
          await this.userAvailabilityRepository.remove(availabilities);
          this.logger.log(`Deleted ${availabilities.length} availability records for user ${userId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to delete availability data for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Anonymize collaboration data for a user (instead of deleting)
   * This is useful when we need to retain data for legal or audit purposes
   * @param userId The ID of the user whose data should be anonymized
   */
  async anonymizeUserCollaborationData(userId: string): Promise&lt;void&gt; {
    try {
      this.logger.log(`Starting anonymization of collaboration data for user ${userId}`);

      // For task shares where user is the owner, we keep them but anonymize the owner info
      const ownedTaskShares = await this.taskShareRepository.find({
        where: { ownerId: userId },
      });
      
      if (ownedTaskShares.length &gt; 0) {
        for (const share of ownedTaskShares) {
          // Anonymize the owner information
          share.ownerId = 'anonymous';
          // Encrypt any sensitive data
          if (share.notes) {
            share.notes = this.encryptionService.encrypt(share.notes);
          }
          await this.taskShareRepository.save(share);
        }
        this.logger.log(`Anonymized ${ownedTaskShares.length} task shares owned by user ${userId}`);
      }

      // For task shares where user is the recipient, we keep them but anonymize the recipient info
      const receivedTaskShares = await this.taskShareRepository.find({
        where: { sharedWithId: userId },
      });
      
      if (receivedTaskShares.length &gt; 0) {
        for (const share of receivedTaskShares) {
          // Anonymize the recipient information
          share.sharedWithId = 'anonymous';
          await this.taskShareRepository.save(share);
        }
        this.logger.log(`Anonymized ${receivedTaskShares.length} task shares received by user ${userId}`);
      }

      // For task assignments where user is the assigner, we keep them but anonymize the assigner info
      const assignedTasks = await this.taskAssignmentRepository.find({
        where: { assignedById: userId },
      });
      
      if (assignedTasks.length &gt; 0) {
        for (const assignment of assignedTasks) {
          // Anonymize the assigner information
          assignment.assignedById = 'anonymous';
          // Encrypt any sensitive data
          if (assignment.notes) {
            assignment.notes = this.encryptionService.encrypt(assignment.notes);
          }
          await this.taskAssignmentRepository.save(assignment);
        }
        this.logger.log(`Anonymized ${assignedTasks.length} task assignments made by user ${userId}`);
      }

      // For task assignments where user is the assignee, we keep them but anonymize the assignee info
      const receivedAssignments = await this.taskAssignmentRepository.find({
        where: { assignedToId: userId },
      });
      
      if (receivedAssignments.length &gt; 0) {
        for (const assignment of receivedAssignments) {
          // Anonymize the assignee information
          assignment.assignedToId = 'anonymous';
          await this.taskAssignmentRepository.save(assignment);
        }
        this.logger.log(`Anonymized ${receivedAssignments.length} task assignments received by user ${userId}`);
      }

      // For comments, we keep them but anonymize the author
      const userComments = await this.taskCommentRepository.find({
        where: { userId },
      });
      
      if (userComments.length &gt; 0) {
        for (const comment of userComments) {
          // Anonymize the author information
          comment.userId = 'anonymous';
          // Encrypt the comment content
          if (comment.content) {
            comment.content = this.encryptionService.encrypt(comment.content);
          }
          await this.taskCommentRepository.save(comment);
        }
        this.logger.log(`Anonymized ${userComments.length} comments by user ${userId}`);
      }

      // For availability records, we delete them as they are personal data
      const userAvailabilities = await this.userAvailabilityRepository.find({
        where: { userId },
      });
      
      if (userAvailabilities.length &gt; 0) {
        await this.userAvailabilityRepository.remove(userAvailabilities);
        this.logger.log(`Deleted ${userAvailabilities.length} availability records for user ${userId}`);
      }

      this.logger.log(`Completed anonymization of collaboration data for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to anonymize collaboration data for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}