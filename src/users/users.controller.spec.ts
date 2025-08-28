import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CalendarViewPreferenceDto } from './dto/calendar-view-preference.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getCalendarViewPreferences: jest.fn(),
    updateCalendarViewPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCalendarViewPreferences', () => {
    it('should call service to get calendar view preferences', async () => {
      const userId = 'user-id';
      const request = { user: { id: userId } };
      const preferences = {
        defaultView: 'week',
        firstDayOfWeek: 0,
        showWeekends: true,
        timeFormat: '12h',
        updatedAt: new Date(),
      };

      mockUsersService.getCalendarViewPreferences.mockResolvedValue(preferences);

      const result = await controller.getCalendarViewPreferences(request);

      expect(result).toEqual(preferences);
      expect(service.getCalendarViewPreferences).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateCalendarViewPreferences', () => {
    it('should call service to update calendar view preferences', async () => {
      const userId = 'user-id';
      const request = { user: { id: userId } };
      const preferenceDto: CalendarViewPreferenceDto = {
        defaultView: 'day',
        firstDayOfWeek: 1,
      };
      const updatedPreferences = {
        defaultView: 'day',
        firstDayOfWeek: 1,
        showWeekends: true,
        timeFormat: '12h',
        updatedAt: new Date(),
      };

      mockUsersService.updateCalendarViewPreferences.mockResolvedValue(updatedPreferences);

      const result = await controller.updateCalendarViewPreferences(request, preferenceDto);

      expect(result).toEqual(updatedPreferences);
      expect(service.updateCalendarViewPreferences).toHaveBeenCalledWith(userId, preferenceDto);
    });
  });
});