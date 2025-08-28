import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { Notification } from '../entities/notification.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getUnreadCount: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    mockNotificationService = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of notifications', async () => {
      const userId = 'user123';
      const skip = 0;
      const take = 10;
      const result: Notification[] = [
        {
          id: 'notif1',
          userId: 'user123',
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'task_reminder',
          channel: 'email',
          priority: 2,
          read: false,
          dismissed: false,
        } as Notification,
      ];

      mockNotificationService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(skip, take, userId)).toBe(result);
      expect(mockNotificationService.findAll).toHaveBeenCalledWith(userId, skip, take);
    });
  });

  describe('findOne', () => {
    it('should return a single notification', async () => {
      const id = 'notif123';
      const userId = 'user123';
      const result = {
        id: 'notif123',
        userId: 'user123',
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'task_reminder',
        channel: 'email',
        priority: 2,
        read: false,
        dismissed: false,
      } as Notification;

      mockNotificationService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(id, userId)).toBe(result);
      expect(mockNotificationService.findOne).toHaveBeenCalledWith(id, userId);
    });
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const userId = 'user123';
      const createDto: CreateNotificationDto = {
        title: 'New Notification',
        message: 'This is a new notification',
        type: 'task_reminder',
        channel: 'email',
        priority: 2,
        relatedEntityId: 'task123',
        relatedEntityType: 'task',
      };
      const result = {
        id: 'new-notif',
        userId: 'user123',
        ...createDto,
        read: false,
        dismissed: false,
      } as Notification;

      mockNotificationService.create.mockResolvedValue(result);

      expect(await controller.create(createDto, userId)).toBe(result);
      expect(mockNotificationService.create).toHaveBeenCalledWith(createDto, userId);
    });
  });

  describe('update', () => {
    it('should update a notification', async () => {
      const id = 'notif123';
      const userId = 'user123';
      const updateDto: UpdateNotificationDto = {
        read: true,
      };
      const result = {
        id: 'notif123',
        userId: 'user123',
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'task_reminder',
        channel: 'email',
        priority: 2,
        read: true,
        dismissed: false,
      } as Notification;

      mockNotificationService.update.mockResolvedValue(result);

      expect(await controller.update(id, userId, updateDto)).toBe(result);
      expect(mockNotificationService.update).toHaveBeenCalledWith(id, userId, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a notification', async () => {
      const id = 'notif123';
      const userId = 'user123';

      mockNotificationService.remove.mockResolvedValue();

      await controller.remove(id, userId);
      expect(mockNotificationService.remove).toHaveBeenCalledWith(id, userId);
    });
  });

  describe('getUnreadCount', () => {
    it('should return the unread count', async () => {
      const userId = 'user123';
      const count = 5;

      mockNotificationService.getUnreadCount.mockResolvedValue(count);

      expect(await controller.getUnreadCount(userId)).toEqual({ count });
      expect(mockNotificationService.getUnreadCount).toHaveBeenCalledWith(userId);
    });
  });
});