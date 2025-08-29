import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { QuietHoursService } from '../services/quiet-hours.service';
import { NotificationPreferenceDto } from '../dto/notification-preference.dto';
import { NotificationPreference } from '../entities/notification-preference.entity';

describe('NotificationPreferencesController', () => {
  let controller: NotificationPreferencesController;
  let mockNotificationPreferenceService: jest.Mocked<NotificationPreferenceService>;
  let mockQuietHoursService: jest.Mocked<QuietHoursService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPreferencesController],
      providers: [
        {
          provide: NotificationPreferenceService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: QuietHoursService,
          useValue: {
            getQuietHoursFeedback: jest.fn(),
            isWithinQuietHours: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationPreferencesController>(NotificationPreferencesController);
    mockNotificationPreferenceService = module.get(NotificationPreferenceService);
    mockQuietHoursService = module.get(QuietHoursService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return notification preferences for a user', async () => {
      const userId = 'user123';
      const result = {
        id: 'pref123',
        userId: 'user123',
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
      } as NotificationPreference;

      mockNotificationPreferenceService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(userId)).toBe(result);
      expect(mockNotificationPreferenceService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update notification preferences for a user', async () => {
      const userId = 'user123';
      const updateDto: NotificationPreferenceDto = {
        emailEnabled: false,
        pushEnabled: true,
      };
      const result = {
        id: 'pref123',
        userId: 'user123',
        emailEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
      } as NotificationPreference;

      mockNotificationPreferenceService.update.mockResolvedValue(result);

      expect(await controller.update(updateDto, userId)).toBe(result);
      expect(mockNotificationPreferenceService.update).toHaveBeenCalledWith(userId, updateDto);
    });
  });

  describe('getQuietHoursStatus', () => {
    it('should return quiet hours status', async () => {
      const userId = 'user123';
      const preferences = {
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      } as NotificationPreference;
      
      const feedback = 'Quiet hours are currently active (22:00 - 08:00). Non-critical notifications are suppressed.';
      const isWithinQuietHours = true;

      mockNotificationPreferenceService.findOne.mockResolvedValue(preferences);
      mockQuietHoursService.getQuietHoursFeedback.mockReturnValue(feedback);
      mockQuietHoursService.isWithinQuietHours.mockReturnValue(isWithinQuietHours);

      const result = await controller.getQuietHoursStatus(userId);

      expect(result).toEqual({
        isWithinQuietHours,
        feedback,
        quietHoursEnabled: preferences.quietHoursEnabled,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
      });
      
      expect(mockNotificationPreferenceService.findOne).toHaveBeenCalledWith(userId);
      expect(mockQuietHoursService.getQuietHoursFeedback).toHaveBeenCalledWith(preferences);
      expect(mockQuietHoursService.isWithinQuietHours).toHaveBeenCalledWith(preferences);
    });
  });
});