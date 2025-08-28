import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CalendarViewPreference } from './entities/calendar-view-preference.entity';
import { CalendarViewPreferenceDto } from './dto/calendar-view-preference.dto';

const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCalendarViewPreferenceRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let calendarViewPreferenceRepository: Repository<CalendarViewPreference>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(CalendarViewPreference),
          useValue: mockCalendarViewPreferenceRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    calendarViewPreferenceRepository = module.get<Repository<CalendarViewPreference>>(getRepositoryToken(CalendarViewPreference));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCalendarViewPreferences', () => {
    it('should return existing calendar view preferences', async () => {
      const userId = 'user-id';
      const preference = new CalendarViewPreference();
      preference.userId = userId;
      preference.defaultView = 'day';
      preference.firstDayOfWeek = 1;
      preference.showWeekends = false;
      preference.timeFormat = '24h';
      preference.updatedAt = new Date();

      mockCalendarViewPreferenceRepository.findOne.mockResolvedValue(preference);

      const result = await service.getCalendarViewPreferences(userId);

      expect(result).toEqual({
        defaultView: 'day',
        firstDayOfWeek: 1,
        showWeekends: false,
        timeFormat: '24h',
        updatedAt: preference.updatedAt,
      });
      expect(calendarViewPreferenceRepository.findOne).toHaveBeenCalledWith({ where: { userId }, relations: ['user'] });
    });

    it('should create default preferences when none exist', async () => {
      const userId = 'user-id';
      const newPreference = new CalendarViewPreference();
      newPreference.userId = userId;
      newPreference.defaultView = 'week';
      newPreference.firstDayOfWeek = 0;
      newPreference.showWeekends = true;
      newPreference.timeFormat = '12h';
      newPreference.updatedAt = new Date();

      mockCalendarViewPreferenceRepository.findOne.mockResolvedValue(null);
      mockCalendarViewPreferenceRepository.create.mockReturnValue(newPreference);
      mockCalendarViewPreferenceRepository.save.mockResolvedValue(newPreference);

      const result = await service.getCalendarViewPreferences(userId);

      expect(result).toEqual({
        defaultView: 'week',
        firstDayOfWeek: 0,
        showWeekends: true,
        timeFormat: '12h',
        updatedAt: newPreference.updatedAt,
      });
      expect(calendarViewPreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        defaultView: 'week',
        firstDayOfWeek: 0,
        showWeekends: true,
        timeFormat: '12h',
      });
      expect(calendarViewPreferenceRepository.save).toHaveBeenCalledWith(newPreference);
    });
  });

  describe('updateCalendarViewPreferences', () => {
    it('should create new preferences when none exist', async () => {
      const userId = 'user-id';
      const preferenceDto: CalendarViewPreferenceDto = {
        defaultView: 'day',
        firstDayOfWeek: 1,
        showWeekends: false,
        timeFormat: '24h',
      };

      const newPreference = new CalendarViewPreference();
      newPreference.userId = userId;
      newPreference.defaultView = 'day';
      newPreference.firstDayOfWeek = 1;
      newPreference.showWeekends = false;
      newPreference.timeFormat = '24h';
      newPreference.updatedAt = new Date();

      mockCalendarViewPreferenceRepository.findOne.mockResolvedValue(null);
      mockCalendarViewPreferenceRepository.create.mockReturnValue(newPreference);
      mockCalendarViewPreferenceRepository.save.mockResolvedValue(newPreference);

      const result = await service.updateCalendarViewPreferences(userId, preferenceDto);

      expect(result).toEqual({
        defaultView: 'day',
        firstDayOfWeek: 1,
        showWeekends: false,
        timeFormat: '24h',
        updatedAt: newPreference.updatedAt,
      });
      expect(calendarViewPreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        defaultView: 'day',
        firstDayOfWeek: 1,
        showWeekends: false,
        timeFormat: '24h',
      });
      expect(calendarViewPreferenceRepository.save).toHaveBeenCalledWith(newPreference);
    });

    it('should update existing preferences', async () => {
      const userId = 'user-id';
      const preferenceDto: CalendarViewPreferenceDto = {
        defaultView: 'day',
        firstDayOfWeek: 1,
      };

      const existingPreference = new CalendarViewPreference();
      existingPreference.userId = userId;
      existingPreference.defaultView = 'week';
      existingPreference.firstDayOfWeek = 0;
      existingPreference.showWeekends = true;
      existingPreference.timeFormat = '12h';

      const updatedPreference = new CalendarViewPreference();
      updatedPreference.userId = userId;
      updatedPreference.defaultView = 'day';
      updatedPreference.firstDayOfWeek = 1;
      updatedPreference.showWeekends = true;
      updatedPreference.timeFormat = '12h';
      updatedPreference.updatedAt = new Date();

      mockCalendarViewPreferenceRepository.findOne.mockResolvedValue(existingPreference);
      mockCalendarViewPreferenceRepository.save.mockResolvedValue(updatedPreference);

      const result = await service.updateCalendarViewPreferences(userId, preferenceDto);

      expect(result).toEqual({
        defaultView: 'day',
        firstDayOfWeek: 1,
        showWeekends: true,
        timeFormat: '12h',
        updatedAt: updatedPreference.updatedAt,
      });
      expect(calendarViewPreferenceRepository.save).toHaveBeenCalledWith(existingPreference);
      expect(existingPreference.defaultView).toBe('day');
      expect(existingPreference.firstDayOfWeek).toBe(1);
    });

    it('should only update provided fields', async () => {
      const userId = 'user-id';
      const preferenceDto: CalendarViewPreferenceDto = {
        defaultView: 'day',
      };

      const existingPreference = new CalendarViewPreference();
      existingPreference.userId = userId;
      existingPreference.defaultView = 'week';
      existingPreference.firstDayOfWeek = 0;
      existingPreference.showWeekends = true;
      existingPreference.timeFormat = '12h';

      const updatedPreference = new CalendarViewPreference();
      updatedPreference.userId = userId;
      updatedPreference.defaultView = 'day';
      updatedPreference.firstDayOfWeek = 0; // Should remain unchanged
      updatedPreference.showWeekends = true; // Should remain unchanged
      updatedPreference.timeFormat = '12h'; // Should remain unchanged
      updatedPreference.updatedAt = new Date();

      mockCalendarViewPreferenceRepository.findOne.mockResolvedValue(existingPreference);
      mockCalendarViewPreferenceRepository.save.mockResolvedValue(updatedPreference);

      const result = await service.updateCalendarViewPreferences(userId, preferenceDto);

      expect(result).toEqual({
        defaultView: 'day',
        firstDayOfWeek: 0,
        showWeekends: true,
        timeFormat: '12h',
        updatedAt: updatedPreference.updatedAt,
      });
      expect(existingPreference.defaultView).toBe('day');
      expect(existingPreference.firstDayOfWeek).toBe(0); // Unchanged
      expect(existingPreference.showWeekends).toBe(true); // Unchanged
      expect(existingPreference.timeFormat).toBe('12h'); // Unchanged
    });
  });
});