import { Task } from '../entities/task.entity';
import { TaskShare } from '../../collaboration/task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../../collaboration/task-assignment/entities/task-assignment.entity';
import { TaskComment } from '../../collaboration/comments/entities/task-comment.entity';

export class TaskWithCollaborationDto {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: number;
  status: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  parentId: string;
  position: number;
  userId: string;
  projectId: string;
  
  // Collaboration data
  sharesCount: number;
  assignmentsCount: number;
  commentsCount: number;
  
  // Summary of collaboration data for the current user
  sharedWithMe: boolean;
  assignedToMe: boolean;
  myPermissions: 'view' | 'edit' | 'manage' | null;
  
  // Related entities (from original task)
  project?: any;
  tags?: any[];
  timeBlocks?: any[];
  subtasks?: any[];
  attachments?: any[];

  static fromTask(task: Task, currentUserId?: string): TaskWithCollaborationDto {
    const dto = new TaskWithCollaborationDto();
    
    // Copy basic task properties
    dto.id = task.id;
    dto.title = task.title;
    dto.description = task.description;
    dto.dueDate = task.dueDate;
    dto.priority = task.priority;
    dto.status = task.status;
    dto.completedAt = task.completedAt;
    dto.createdAt = task.createdAt;
    dto.updatedAt = task.updatedAt;
    dto.parentId = task.parentId;
    dto.position = task.position;
    dto.userId = task.userId;
    dto.projectId = task.projectId;
    
    // Count collaboration entities
    dto.sharesCount = task.shares ? task.shares.length : 0;
    dto.assignmentsCount = task.assignments ? task.assignments.length : 0;
    dto.commentsCount = task.comments ? task.comments.length : 0;
    
    // Determine user-specific collaboration info
    if (currentUserId) {
      dto.sharedWithMe = task.shares ? 
        task.shares.some(share => share.sharedWithId === currentUserId && !share.isRevoked) : 
        false;
        
      dto.assignedToMe = task.assignments ? 
        task.assignments.some(assignment => assignment.assignedToId === currentUserId) : 
        false;
        
      const userShare = task.shares?.find(share => share.sharedWithId === currentUserId && !share.isRevoked);
      dto.myPermissions = userShare ? userShare.permissionLevel : null;
    } else {
      dto.sharedWithMe = false;
      dto.assignedToMe = false;
      dto.myPermissions = null;
    }
    
    // Copy related entities
    dto.project = task.project;
    dto.tags = task.tags;
    dto.timeBlocks = task.timeBlocks;
    dto.subtasks = task.subtasks;
    dto.attachments = task.attachments;
    
    return dto;
  }
}