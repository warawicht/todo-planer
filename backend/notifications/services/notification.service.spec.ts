import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from './notification.service';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { QuietHoursService } from './quiet-hours.service';
import { NotificationPreferenceService } from './notification-preference.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: Repository<Notification>;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockQuietHoursService = {
    // Mock methods as needed
  };

  const mockNotificationPreferenceService = {
    findOne: jest.fn(),
    // Mock other methods as needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: QuietHoursService,
          useValue: mockQuietHoursService,
        },
        {
          provide: NotificationPreferenceService,
          useValue: mockNotificationPreferenceService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createNotificationDto: CreateNotificationDto = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'task_reminder',
        channel: 'email',
        priority: 2,
        relatedEntityId: 'task-123',
        relatedEntityType: 'task',
      };

      const userId = 'user-123';
      const notification = new Notification();
      Object.assign(notification, createNotificationDto, { userId });

      mockNotificationRepository.create.mockReturnValue(notification);
      mockNotificationRepository.save.mockResolvedValue(notification);

      const result = await service.create(createNotificationDto, userId);

      expect(result).toEqual(notification);
      expect(repository.create).toHaveBeenCalledWith({ ...createNotificationDto, userId });
      expect(repository.save).toHaveBeenCalledWith(notification);
    });
  });

  describe('findAll', () => {
    it('should return an array of notifications', async () => {
      const userId = 'user-123';
      const notifications = [new Notification(), new Notification()];
      mockNotificationRepository.find.mockResolvedValue(notifications);

      const result = await service.findAll(userId);

      expect(result).toEqual(notifications);
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single notification', async () => {
      const id = 'notification-123';
      const userId = 'user-123';
      const notification = new Notification();
      mockNotificationRepository.findOne.mockResolvedValue(notification);

      const result = await service.findOne(id, userId);

      expect(result).toEqual(notification);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id, userId } });
    });
  });

  describe('update', () => {
    it('should update a notification', async () => {
      const id = 'notification-123';
      const userId = 'user-123';
      const updateNotificationDto: UpdateNotificationDto = { read: true };
      const updatedNotification = new Notification();
      Object.assign(updatedNotification, { id, userId, ...updateNotificationDto });

      mockNotificationRepository.update.mockResolvedValue(undefined);
      mockNotificationRepository.findOne.mockResolvedValue(updatedNotification);

      const result = await service.update(id, userId, updateNotificationDto);

      expect(result).toEqual(updatedNotification);
      expect(repository.update).toHaveBeenCalledWith({ id, userId }, updateNotificationDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id, userId } });
    });
  });

  describe('remove', () => {
    it('should remove a notification', async () => {
      const id = 'notification-123';
      const userId = 'user-123';

      mockNotificationRepository.delete.mockResolvedValue(undefined);

      await service.remove(id, userId);

      expect(repository.delete).toHaveBeenCalledWith({ id, userId });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const id = 'notification-123';
      const userId = 'user-123';
      const notification = new Notification();
      notification.read = false;

      const updatedNotification = new Notification();
      Object.assign(updatedNotification, notification, { read: true, readAt: new Date() });

      mockNotificationRepository.findOne.mockResolvedValue(notification);
      mockNotificationRepository.save.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(id, userId);

      expect(result).toEqual(updatedNotification);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id, userId } });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ read: true }));
    });

    it('should return the notification if already read', async () => {
      const id = 'notification-123';
      const userId = 'user-123';
      const notification = new Notification();
      notification.read = true;

      mockNotificationRepository.findOne.mockResolvedValue(notification);

      const result = await service.markAsRead(id, userId);

      expect(result).toEqual(notification);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id, userId } });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      const userId = 'user-123';
      const count = 5;

      mockNotificationRepository.count.mockResolvedValue(count);

      const result = await service.getUnreadCount(userId);

      expect(result).toEqual(count);
      expect(repository.count).toHaveBeenCalledWith({ where: { userId, read: false } });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'user-123';

      mockNotificationRepository.update.mockResolvedValue(undefined);

      await service.markAllAsRead(userId);

      expect(repository.update).toHaveBeenCalledWith(
        { userId, read: false },
        { read: true, readAt: expect.any(Date) },
      );
    });
  });
});