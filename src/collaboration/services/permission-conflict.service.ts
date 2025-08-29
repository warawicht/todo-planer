import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { TaskShare } from '../task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../task-assignment/entities/task-assignment.entity';

export interface PermissionConflict {
  type: 'share' | 'assignment';
  entityId: string;
  conflictingPermissions: string[];
  resolution: 'merge' | 'override' | 'reject';
}

@Injectable()
export class PermissionConflictService {
  private readonly logger = new Logger(PermissionConflictService.name);

  /**
   * Detect permission conflicts between task shares and assignments
   * @param taskShare The task share entity
   * @param taskAssignment The task assignment entity
   * @returns Conflict details or null if no conflict
   */
  detectPermissionConflicts(taskShare: TaskShare, taskAssignment: TaskAssignment): PermissionConflict | null {
    // Check if the same user is both shared and assigned the task
    if (taskShare.sharedWithId === taskAssignment.assignedToId) {
      this.logger.debug(`Permission conflict detected for user ${taskShare.sharedWithId} on task ${taskShare.taskId}`);
      
      return {
        type: 'share',
        entityId: taskShare.id,
        conflictingPermissions: [taskShare.permissionLevel, 'assigned'],
        resolution: 'merge'
      };
    }
    
    return null;
  }

  /**
   * Resolve permission conflicts based on conflict resolution strategy
   * @param conflict The permission conflict details
   * @param taskShare The task share entity
   * @param taskAssignment The task assignment entity
   * @returns Resolved permission level
   */
  resolvePermissionConflict(conflict: PermissionConflict, taskShare: TaskShare, taskAssignment: TaskAssignment): string {
    switch (conflict.resolution) {
      case 'merge':
        // Merge permissions - give the higher permission level
        return this.getHigherPermissionLevel(taskShare.permissionLevel, 'edit');
      case 'override':
        // Override with assignment permissions
        return 'edit';
      case 'reject':
        // Reject the conflict
        throw new ConflictException('Permission conflict cannot be resolved automatically');
      default:
        // Default to merge strategy
        return this.getHigherPermissionLevel(taskShare.permissionLevel, 'edit');
    }
  }

  /**
   * Get the higher permission level between two permissions
   * @param perm1 First permission level
   * @param perm2 Second permission level
   * @returns The higher permission level
   */
  private getHigherPermissionLevel(perm1: string, perm2: string): string {
    const permissionHierarchy = ['view', 'edit', 'manage'];
    const index1 = permissionHierarchy.indexOf(perm1);
    const index2 = permissionHierarchy.indexOf(perm2);
    
    return index1 >= index2 ? perm1 : perm2;
  }

  /**
   * Validate that permission changes don't create conflicts
   * @param taskShare The task share entity
   * @param newPermissionLevel The new permission level
   * @returns Whether the change is valid
   */
  validatePermissionChange(taskShare: TaskShare, newPermissionLevel: string): boolean {
    // Check if the new permission level would create a conflict with existing assignments
    // For now, we'll allow all changes but log potential conflicts
    this.logger.debug(`Validating permission change for task share ${taskShare.id} from ${taskShare.permissionLevel} to ${newPermissionLevel}`);
    
    return true;
  }
}