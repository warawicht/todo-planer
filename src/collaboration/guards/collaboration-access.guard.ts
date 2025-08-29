import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { CollaborationPermissionService } from '../services/collaboration-permission.service';
import { TaskSharingService } from '../task-sharing/services/task-sharing.service';
import { TaskAssignmentService } from '../task-assignment/services/task-assignment.service';
import { TaskService } from '../../tasks/services/tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Repository } from 'typeorm';

export interface CollaborationAccessControlOptions {
  resourceType: 'task' | 'comment' | 'availability' | 'calendar';
  action: 'view' | 'edit' | 'delete' | 'assign' | 'share' | 'comment';
  checkOwnership?: boolean;
  checkTaskOwnership?: boolean;
}

@Injectable()
export class CollaborationAccessGuard implements CanActivate {
  private readonly logger = new Logger(CollaborationAccessGuard.name);

  constructor(
    private readonly collaborationPermissionService: CollaborationPermissionService,
    private readonly taskSharingService: TaskSharingService,
    private readonly taskAssignmentService: TaskAssignmentService,
    private readonly taskService: TaskService,
    @InjectRepository(Task)
    private taskRepository: Repository&lt;Task&gt;,
  ) {}

  async canActivate(context: ExecutionContext): Promise&lt;boolean&gt; {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;
    const query = request.query;
    const body = request.body;
    
    // Get the resource type and action from the route handler metadata
    const options: CollaborationAccessControlOptions = Reflect.getMetadata(
      'collaborationAccessControl',
      context.getHandler(),
    );
    
    if (!options) {
      this.logger.warn('No collaboration access control options found for route');
      return true; // Allow access if no options are specified
    }

    try {
      // Check permissions based on resource type and action
      switch (options.resourceType) {
        case 'task':
          return await this.checkTaskAccess(user, params, options);
        case 'comment':
          return await this.checkCommentAccess(user, params, options);
        case 'availability':
          return await this.checkAvailabilityAccess(user, params, options);
        case 'calendar':
          return await this.checkCalendarAccess(user, params, options);
        default:
          this.logger.warn(`Unknown resource type: ${options.resourceType}`);
          return false;
      }
    } catch (error) {
      this.logger.error(`Error checking collaboration access: ${error.message}`, error.stack);
      throw new ForbiddenException('Access denied');
    }
  }

  private async checkTaskAccess(user: any, params: any, options: CollaborationAccessControlOptions): Promise&lt;boolean&gt; {
    const taskId = params.taskId || params.id || body.taskId;
    
    if (!taskId) {
      this.logger.warn('Task ID not found in request');
      return false;
    }

    // Get the task
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['user'], // Load the task owner
    });

    if (!task) {
      this.logger.warn(`Task not found: ${taskId}`);
      return false;
    }

    // If checking ownership, verify the user is the task owner
    if (options.checkOwnership &amp;&amp; task.userId !== user.id) {
      this.logger.warn(`User ${user.id} is not the owner of task ${taskId}`);
      return false;
    }

    // If checking task ownership specifically, verify the user is the task owner
    if (options.checkTaskOwnership &amp;&amp; task.userId !== user.id) {
      this.logger.warn(`User ${user.id} is not the owner of task ${taskId}`);
      return false;
    }

    // Get task share information if it exists
    const taskShare = await this.taskSharingService.getTaskShareByTaskAndUser(taskId, user.id);

    // Check permissions based on action
    switch (options.action) {
      case 'view':
        return this.collaborationPermissionService.canViewTask(user, task, taskShare);
      case 'edit':
        return this.collaborationPermissionService.canEditTask(user, task, taskShare);
      case 'delete':
        // For delete, we check if user can manage the task
        return this.collaborationPermissionService.canManageTask(user, task, taskShare);
      case 'assign':
        return this.collaborationPermissionService.canAssignTask(user, task, taskShare);
      case 'share':
        // Only task owner can share
        return task.userId === user.id;
      default:
        this.logger.warn(`Unknown action for task resource: ${options.action}`);
        return false;
    }
  }

  private async checkCommentAccess(user: any, params: any, options: CollaborationAccessControlOptions): Promise&lt;boolean&gt; {
    const commentId = params.commentId || params.id;
    const taskId = params.taskId || body.taskId;
    
    if (!commentId &amp;&amp; !taskId) {
      this.logger.warn('Comment ID or Task ID not found in request');
      return false;
    }

    let task: Task;
    if (taskId) {
      task = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['user'], // Load the task owner
      });
    } else {
      // If we only have commentId, we'd need to get the task from the comment
      // This would require importing the TaskComment entity and repository
      // For now, we'll assume taskId is provided
      this.logger.warn('Task ID required for comment access control');
      return false;
    }

    if (!task) {
      this.logger.warn(`Task not found: ${taskId}`);
      return false;
    }

    // Get task share information if it exists
    const taskShare = await this.taskSharingService.getTaskShareByTaskAndUser(task.id, user.id);

    // Check permissions based on action
    switch (options.action) {
      case 'view':
        return this.collaborationPermissionService.canViewTask(user, task, taskShare);
      case 'edit':
        // For comments, we need to check if user can add comments to the task
        return this.collaborationPermissionService.canAddComment(user, task, taskShare);
      case 'delete':
        // For comment deletion, we'd need to get the specific comment to check ownership
        // This would require importing the TaskComment entity and repository
        // For now, we'll check if user can manage the task
        return this.collaborationPermissionService.canManageTask(user, task, taskShare);
      case 'comment':
        return this.collaborationPermissionService.canAddComment(user, task, taskShare);
      default:
        this.logger.warn(`Unknown action for comment resource: ${options.action}`);
        return false;
    }
  }

  private async checkAvailabilityAccess(user: any, params: any, options: CollaborationAccessControlOptions): Promise&lt;boolean&gt; {
    const userId = params.userId || user.id;
    
    // Users can only access their own availability data
    if (userId !== user.id) {
      this.logger.warn(`User ${user.id} attempted to access availability data for user ${userId}`);
      return false;
    }

    // For team availability, we'd check if the user has permission to view team data
    // This might be based on team membership or other organizational relationships
    // For now, we'll allow access to own availability data
    return true;
  }

  private async checkCalendarAccess(user: any, params: any, options: CollaborationAccessControlOptions): Promise&lt;boolean&gt; {
    const userIds = params.userIds || query.userIds;
    
    // If requesting team calendar data, check if user has permission to view team data
    if (userIds &amp;&amp; Array.isArray(userIds)) {
      // Check if user is requesting their own data or has permission to view team data
      if (userIds.includes(user.id)) {
        return true;
      }
      
      // For team calendar access, we might need to check team membership or other permissions
      // For now, we'll only allow access to own data
      this.logger.warn(`User ${user.id} attempted to access team calendar data without permission`);
      return false;
    }
    
    // Default to allowing access to own calendar data
    return true;
  }
}