import { CollaborationPermissionService } from './collaboration-permission.service';
import { TaskShare } from '../task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../task-assignment/entities/task-assignment.entity';
import { TaskComment } from '../comments/entities/task-comment.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';

describe('CollaborationPermissionService', () => {
  let service: CollaborationPermissionService;
  let user: User;
  let task: Task;
  let taskShare: TaskShare;
  let taskAssignment: TaskAssignment;
  let comment: TaskComment;

  beforeEach(() => {
    service = new CollaborationPermissionService();
    
    user = new User();
    user.id = 'user1';
    
    task = new Task();
    task.id = 'task1';
    task.userId = 'user1';
    
    taskShare = new TaskShare();
    taskShare.id = 'share1';
    taskShare.taskId = 'task1';
    taskShare.ownerId = 'user1';
    taskShare.sharedWithId = 'user2';
    taskShare.isAccepted = true;
    taskShare.isRevoked = false;
    taskShare.permissionLevel = 'view';
    
    taskAssignment = new TaskAssignment();
    taskAssignment.id = 'assignment1';
    taskAssignment.taskId = 'task1';
    taskAssignment.assignedById = 'user1';
    taskAssignment.assignedToId = 'user2';
    taskAssignment.status = 'accepted';
    
    comment = new TaskComment();
    comment.id = 'comment1';
    comment.taskId = 'task1';
    comment.userId = 'user2';
  });

  describe('canViewTask', () => {
    it('should allow task owner to view task', () => {
      const result = service.canViewTask(user, task);
      expect(result).toBe(true);
    });

    it('should allow accepted shared user to view task', () => {
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canViewTask(sharedUser, task, taskShare);
      expect(result).toBe(true);
    });

    it('should not allow non-owner, non-shared user to view task', () => {
      const otherUser = new User();
      otherUser.id = 'user3';
      
      const result = service.canViewTask(otherUser, task);
      expect(result).toBe(false);
    });
  });

  describe('canEditTask', () => {
    it('should allow task owner to edit task', () => {
      const result = service.canEditTask(user, task);
      expect(result).toBe(true);
    });

    it('should allow shared user with edit permissions to edit task', () => {
      taskShare.permissionLevel = 'edit';
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canEditTask(sharedUser, task, taskShare);
      expect(result).toBe(true);
    });

    it('should allow shared user with manage permissions to edit task', () => {
      taskShare.permissionLevel = 'manage';
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canEditTask(sharedUser, task, taskShare);
      expect(result).toBe(true);
    });

    it('should not allow shared user with view permissions to edit task', () => {
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canEditTask(sharedUser, task, taskShare);
      expect(result).toBe(false);
    });
  });

  describe('canManageTask', () => {
    it('should allow task owner to manage task', () => {
      const result = service.canManageTask(user, task);
      expect(result).toBe(true);
    });

    it('should allow shared user with manage permissions to manage task', () => {
      taskShare.permissionLevel = 'manage';
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canManageTask(sharedUser, task, taskShare);
      expect(result).toBe(true);
    });

    it('should not allow shared user with edit permissions to manage task', () => {
      taskShare.permissionLevel = 'edit';
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canManageTask(sharedUser, task, taskShare);
      expect(result).toBe(false);
    });
  });

  describe('canDeleteTaskShare', () => {
    it('should allow task owner to delete task share', () => {
      const result = service.canDeleteTaskShare(user, taskShare);
      expect(result).toBe(true);
    });

    it('should allow shared user to delete their own share', () => {
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canDeleteTaskShare(sharedUser, taskShare);
      expect(result).toBe(true);
    });

    it('should not allow other users to delete task share', () => {
      const otherUser = new User();
      otherUser.id = 'user3';
      
      const result = service.canDeleteTaskShare(otherUser, taskShare);
      expect(result).toBe(false);
    });
  });

  describe('canUpdateTaskShare', () => {
    it('should allow task owner to update task share', () => {
      const result = service.canUpdateTaskShare(user, taskShare);
      expect(result).toBe(true);
    });

    it('should not allow shared user to update task share', () => {
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canUpdateTaskShare(sharedUser, taskShare);
      expect(result).toBe(false);
    });
  });

  describe('canAcceptTaskShare', () => {
    it('should allow shared user to accept task share', () => {
      const sharedUser = new User();
      sharedUser.id = 'user2';
      taskShare.isAccepted = false;
      
      const result = service.canAcceptTaskShare(sharedUser, taskShare);
      expect(result).toBe(true);
    });

    it('should not allow task owner to accept task share', () => {
      taskShare.isAccepted = false;
      
      const result = service.canAcceptTaskShare(user, taskShare);
      expect(result).toBe(false);
    });

    it('should not allow already accepted share to be accepted again', () => {
      const sharedUser = new User();
      sharedUser.id = 'user2';
      taskShare.isAccepted = true;
      
      const result = service.canAcceptTaskShare(sharedUser, taskShare);
      expect(result).toBe(false);
    });
  });

  describe('canAssignTask', () => {
    it('should allow task owner to assign task', () => {
      const result = service.canAssignTask(user, task);
      expect(result).toBe(true);
    });

    it('should allow shared user with manage permissions to assign task', () => {
      taskShare.permissionLevel = 'manage';
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canAssignTask(sharedUser, task, taskShare);
      expect(result).toBe(true);
    });

    it('should not allow shared user with edit permissions to assign task', () => {
      taskShare.permissionLevel = 'edit';
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canAssignTask(sharedUser, task, taskShare);
      expect(result).toBe(false);
    });
  });

  describe('canUpdateTaskAssignmentStatus', () => {
    it('should allow assigned user to update their assignment status', () => {
      const assignedUser = new User();
      assignedUser.id = 'user2';
      
      const result = service.canUpdateTaskAssignmentStatus(assignedUser, taskAssignment);
      expect(result).toBe(true);
    });

    it('should allow assigner to update assignment status', () => {
      const result = service.canUpdateTaskAssignmentStatus(user, taskAssignment);
      expect(result).toBe(true);
    });

    it('should not allow other users to update assignment status', () => {
      const otherUser = new User();
      otherUser.id = 'user3';
      
      const result = service.canUpdateTaskAssignmentStatus(otherUser, taskAssignment);
      expect(result).toBe(false);
    });
  });

  describe('canDeleteTaskAssignment', () => {
    it('should allow assigner to delete assignment', () => {
      const result = service.canDeleteTaskAssignment(user, taskAssignment);
      expect(result).toBe(true);
    });

    it('should not allow assigned user to delete assignment', () => {
      const assignedUser = new User();
      assignedUser.id = 'user2';
      
      const result = service.canDeleteTaskAssignment(assignedUser, taskAssignment);
      expect(result).toBe(false);
    });
  });

  describe('canAddComment', () => {
    it('should allow task owner to add comment', () => {
      const result = service.canAddComment(user, task);
      expect(result).toBe(true);
    });

    it('should allow shared user to add comment', () => {
      const sharedUser = new User();
      sharedUser.id = 'user2';
      
      const result = service.canAddComment(sharedUser, task, taskShare);
      expect(result).toBe(true);
    });

    it('should allow assigned user to add comment', () => {
      task.assignments = [taskAssignment];
      const assignedUser = new User();
      assignedUser.id = 'user2';
      
      const result = service.canAddComment(assignedUser, task);
      expect(result).toBe(true);
    });

    it('should not allow other users to add comment', () => {
      const otherUser = new User();
      otherUser.id = 'user3';
      
      const result = service.canAddComment(otherUser, task);
      expect(result).toBe(false);
    });
  });

  describe('canEditOwnComment', () => {
    it('should allow user to edit their own comment', () => {
      const commentUser = new User();
      commentUser.id = 'user2';
      comment.userId = 'user2';
      
      const result = service.canEditOwnComment(commentUser, comment);
      expect(result).toBe(true);
    });

    it('should not allow user to edit others comments', () => {
      const otherUser = new User();
      otherUser.id = 'user3';
      comment.userId = 'user2';
      
      const result = service.canEditOwnComment(otherUser, comment);
      expect(result).toBe(false);
    });
  });

  describe('canDeleteComment', () => {
    it('should allow user to delete their own comment', () => {
      const commentUser = new User();
      commentUser.id = 'user2';
      comment.userId = 'user2';
      
      const result = service.canDeleteComment(commentUser, comment, task);
      expect(result).toBe(true);
    });

    it('should allow task owner to delete any comment', () => {
      comment.userId = 'user2';
      
      const result = service.canDeleteComment(user, comment, task);
      expect(result).toBe(true);
    });

    it('should not allow other users to delete comments', () => {
      const otherUser = new User();
      otherUser.id = 'user3';
      comment.userId = 'user2';
      
      const result = service.canDeleteComment(otherUser, comment, task);
      expect(result).toBe(false);
    });
  });

  describe('checkPermission', () => {
    it('should not throw exception when permission is granted', () => {
      expect(() => {
        service.checkPermission(true, 'Test message');
      }).not.toThrow();
    });

    it('should throw ForbiddenException when permission is denied', () => {
      expect(() => {
        service.checkPermission(false, 'Test message');
      }).toThrow('Test message');
    });

    it('should throw ForbiddenException with default message when permission is denied and no message provided', () => {
      expect(() => {
        service.checkPermission(false);
      }).toThrow('You do not have permission to perform this action');
    });
  });
});