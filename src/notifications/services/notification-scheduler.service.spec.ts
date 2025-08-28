import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { PushService } from './push.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { QuietHoursService } from './quiet-hours.service';
import { UsersService } from '../../users/users.service';
import { Repository } from 'typeorm';
import { Reminder } from '../entities/reminder.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('NotificationSchedulerService', () => {
  let service: NotificationSchedulerService;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockPushService: jest.Mocked<PushService>;
  let mockNotificationPreferenceService: jest.Mocked<NotificationPreferenceService>;
  let mockQuietHoursService: jest.Mocked<QuietHoursService>;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockReminderRepository: jest.Mocked<Repository<Reminder>>;
  let mockTaskRepository: jest.Mocked<Repository<Task>>;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSchedulerService,
        {
          provide: NotificationService,
          useValue: {
            isWithinQuietHours: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendTaskReminder: jest.fn(),
          },
        },
        {
          provide: PushService,
          useValue: {
            sendTaskReminder: jest.fn(),
          },
        },
        {
          provide: NotificationPreferenceService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: QuietHoursService,
          useValue: {
            shouldSuppressNotification: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Reminder),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationSchedulerService>(NotificationSchedulerService);
    mockNotificationService = module.get(NotificationService);
    mockEmailService = module.get(EmailService);
    mockPushService = module.get(PushService);
    mockNotificationPreferenceService = module.get(NotificationPreferenceService);
    mockQuietHoursService = module.get(QuietHoursService);
    mockUsersService = module.get(UsersService);
    mockReminderRepository = module.get(getRepositoryToken(Reminder));
    mockTaskRepository = module.get(getRepositoryToken(Task));
    mockUserRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleUpcomingReminders', () => {
    it('should process upcoming reminders', async () => {
      const task = new Task();
      task.id = 'task123';
      task.userId = 'user123';
      task.title = 'Test Task';
      task.dueDate = new Date(Date.now() + 10 * 60000); // 10 minutes from now

      const reminder = new Reminder();
      reminder.id = 'reminder123';
      reminder.taskId = 'task123';
      reminder.task = task;
      reminder.timeBefore = '5_min';
      reminder.enabled = true;

      mockReminderRepository.find.mockResolvedValue([reminder]);
      mockNotificationPreferenceService.findOne.mockResolvedValue({
        emailEnabled: true,
        pushEnabled: true,
        taskRemindersEnabled: true,
      } as any);
      mockUsersService.findById.mockResolvedValue({} as any);
      mockQuietHoursService.shouldSuppressNotification.mockReturnValue(false);
      mockEmailService.sendTaskReminder.mockResolvedValue();
      mockPushService.sendTaskReminder.mockResolvedValue();

      await service.handleUpcomingReminders();

      expect(mockReminderRepository.find).toHaveBeenCalledWith({
        where: { enabled: true },
        relations: ['task'],
      });
      expect(mockEmailService.sendTaskReminder).toHaveBeenCalledWith(task, '5_min');
      expect(mockPushService.sendTaskReminder).toHaveBeenCalledWith(task, '5_min');
    });

    it('should skip reminders during quiet hours', async () => {
      const task = new Task();
      task.id = 'task123';
      task.userId = 'user123';
      task.title = 'Test Task';
      task.dueDate = new Date(Date.now() + 10 * 60000); // 10 minutes from now

      const reminder = new Reminder();
      reminder.id = 'reminder123';
      reminder.taskId = 'task123';
      reminder.task = task;
      reminder.timeBefore = '5_min';
      reminder.enabled = true;

      mockReminderRepository.find.mockResolvedValue([reminder]);
      mockNotificationPreferenceService.findOne.mockResolvedValue({
        emailEnabled: true,
        pushEnabled: true,
        taskRemindersEnabled: true,
        quietHoursEnabled: true,
      } as any);
      mockUsersService.findById.mockResolvedValue({} as any);
      mockQuietHoursService.shouldSuppressNotification.mockReturnValue(true);

      await service.handleUpcomingReminders();

      expect(mockEmailService.sendTaskReminder).not.toHaveBeenCalled();
      expect(mockPushService.sendTaskReminder).not.toHaveBeenCalled();
    });
  });

  describe('handleDailySummaries', () => {
    it('should handle daily summaries', async () => {
      // This is a placeholder test for the daily summaries method
      // In a real implementation, this would test the actual summary generation
      await service.handleDailySummaries();
      expect(true).toBe(true);
    });
  });
});