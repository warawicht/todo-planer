import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationNotificationService } from './collaboration-notification.service';
import { NotificationService } from '../../notifications/services/notification.service';

describe('CollaborationNotificationService', () => {
  let service: CollaborationNotificationService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaborationNotificationService,
        {
          provide: NotificationService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CollaborationNotificationService>(CollaborationNotificationService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendTaskSharedNotification', () => {
    it('should call notificationService.create with correct parameters', async () => {
      const userId = 'user1';
      const taskId = 'task1';
      const sharedByUserId = 'user2';
      const permissionLevel = 'view';

      await service.sendTaskSharedNotification(userId, taskId, sharedByUserId, permissionLevel);

      expect(notificationService.create).toHaveBeenCalledWith(
        {
          title: 'Task Shared',
          message: 'A task has been shared with you with view permissions',
          type: 'system_alert',
          channel: 'in_app',
          priority: 2,
          relatedEntityId: taskId,
          relatedEntityType: 'task',
        },
        userId
      );
    });
  });

  describe('sendTaskAssignedNotification', () => {
    it('should call notificationService.create with correct parameters', async () => {
      const userId = 'user1';
      const taskId = 'task1';
      const assignedByUserId = 'user2';

      await service.sendTaskAssignedNotification(userId, taskId, assignedByUserId);

      expect(notificationService.create).toHaveBeenCalledWith(
        {
          title: 'Task Assigned',
          message: 'A task has been assigned to you',
          type: 'system_alert',
          channel: 'in_app',
          priority: 3,
          relatedEntityId: taskId,
          relatedEntityType: 'task',
        },
        userId
      );
    });
  });

  describe('sendTaskCommentNotification', () => {
    it('should call notificationService.create with correct parameters', async () => {
      const userId = 'user1';
      const taskId = 'task1';
      const commentId = 'comment1';
      const commentedByUserId = 'user2';

      await service.sendTaskCommentNotification(userId, taskId, commentId, commentedByUserId);

      expect(notificationService.create).toHaveBeenCalledWith(
        {
          title: 'New Comment',
          message: 'A new comment was added to a task you are involved in',
          type: 'system_alert',
          channel: 'in_app',
          priority: 2,
          relatedEntityId: taskId,
          relatedEntityType: 'task',
        },
        userId
      );
    });
  });

  describe('sendAvailabilityUpdatedNotification', () => {
    it('should call notificationService.create with correct parameters', async () => {
      const userId = 'user1';
      const availabilityId = 'availability1';

      await service.sendAvailabilityUpdatedNotification(userId, availabilityId);

      expect(notificationService.create).toHaveBeenCalledWith(
        {
          title: 'Availability Updated',
          message: 'A team member has updated their availability',
          type: 'system_alert',
          channel: 'in_app',
          priority: 1,
          relatedEntityId: availabilityId,
          relatedEntityType: 'task',
        },
        userId
      );
    });
  });
});