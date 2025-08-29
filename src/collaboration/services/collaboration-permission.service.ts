import { Injectable, ForbiddenException } from '@nestjs/common';
import { TaskShare } from '../task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../task-assignment/entities/task-assignment.entity';
import { TaskComment } from '../comments/entities/task-comment.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';

@Injectable()
export class CollaborationPermissionService {
  // Check if user has permission to view a task
  canViewTask(user: User, task: Task, taskShare?: TaskShare): boolean {
    // Owner can always view their task
    if (task.userId === user.id) {
      return true;
    }

    // Check if task is shared with user
    if (taskShare && taskShare.sharedWithId === user.id && taskShare.isAccepted && !taskShare.isRevoked) {
      return true;
    }

    return false;
  }

  // Check if user has permission to edit a task
  canEditTask(user: User, task: Task, taskShare?: TaskShare): boolean {
    // Owner can always edit their task
    if (task.userId === user.id) {
      return true;
    }

    // Check if task is shared with edit or manage permissions
    if (taskShare && 
        taskShare.sharedWithId === user.id && 
        taskShare.isAccepted && 
        !taskShare.isRevoked &&
        (taskShare.permissionLevel === 'edit' || taskShare.permissionLevel === 'manage')) {
      return true;
    }

    return false;
  }

  // Check if user has permission to manage a task
  canManageTask(user: User, task: Task, taskShare?: TaskShare): boolean {
    // Owner can always manage their task
    if (task.userId === user.id) {
      return true;
    }

    // Check if task is shared with manage permissions
    if (taskShare && 
        taskShare.sharedWithId === user.id && 
        taskShare.isAccepted && 
        !taskShare.isRevoked &&
        taskShare.permissionLevel === 'manage') {
      return true;
    }

    return false;
  }

  // Check if user can delete a task share
  canDeleteTaskShare(user: User, taskShare: TaskShare): boolean {
    // Owner can always delete shares of their task
    if (taskShare.ownerId === user.id) {
      return true;
    }

    // User can delete their own shares
    if (taskShare.sharedWithId === user.id) {
      return true;
    }

    return false;
  }

  // Check if user can update a task share
  canUpdateTaskShare(user: User, taskShare: TaskShare): boolean {
    // Only owner can update shares of their task
    return taskShare.ownerId === user.id;
  }

  // Check if user can accept a task share
  canAcceptTaskShare(user: User, taskShare: TaskShare): boolean {
    // Only the user the task was shared with can accept it
    return taskShare.sharedWithId === user.id && !taskShare.isAccepted;
  }

  // Check if user can assign a task
  canAssignTask(user: User, task: Task, taskShare?: TaskShare): boolean {
    // Owner can always assign their task
    if (task.userId === user.id) {
      return true;
    }

    // Check if task is shared with manage permissions
    if (taskShare && 
        taskShare.sharedWithId === user.id && 
        taskShare.isAccepted && 
        !taskShare.isRevoked &&
        taskShare.permissionLevel === 'manage') {
      return true;
    }

    return false;
  }

  // Check if user can update task assignment status
  canUpdateTaskAssignmentStatus(user: User, taskAssignment: TaskAssignment): boolean {
    // User can update their own assignment status
    if (taskAssignment.assignedToId === user.id) {
      return true;
    }

    // Owner can update assignment status
    if (taskAssignment.assignedById === user.id) {
      return true;
    }

    return false;
  }

  // Check if user can delete a task assignment
  canDeleteTaskAssignment(user: User, taskAssignment: TaskAssignment): boolean {
    // Owner can always delete assignments of their task
    // Assigner can delete assignments they made
    if (taskAssignment.assignedById === user.id) {
      return true;
    }

    return false;
  }

  // Check if user can add a comment to a task
  canAddComment(user: User, task: Task, taskShare?: TaskShare): boolean {
    // Owner can always comment on their task
    if (task.userId === user.id) {
      return true;
    }

    // Check if task is shared (any permission level)
    if (taskShare && taskShare.sharedWithId === user.id && taskShare.isAccepted && !taskShare.isRevoked) {
      return true;
    }

    // Assigned user can comment
    if (task.assignments) {
      const assignment = task.assignments.find(a => a.assignedToId === user.id && a.status === 'accepted');
      if (assignment) {
        return true;
      }
    }

    return false;
  }

  // Check if user can edit their own comment
  canEditOwnComment(user: User, comment: TaskComment): boolean {
    // User can edit their own comments
    return comment.userId === user.id;
  }

  // Check if user can delete a comment
  canDeleteComment(user: User, comment: TaskComment, task: Task): boolean {
    // User can delete their own comments
    if (comment.userId === user.id) {
      return true;
    }

    // Task owner can delete any comment on their task
    if (task.userId === user.id) {
      return true;
    }

    return false;
  }

  // Throw ForbiddenException if user doesn't have permission
  checkPermission(hasPermission: boolean, message: string = 'You do not have permission to perform this action'): void {
    if (!hasPermission) {
      throw new ForbiddenException(message);
    }
  }
}