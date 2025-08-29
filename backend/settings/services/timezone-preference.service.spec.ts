import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimezonePreferenceService } from './timezone-preference.service';
import { TimezonePreference } from '../entities/timezone-preference.entity';
import { TimezonePreferenceDto } from '../dto/timezone-preference.dto';
import { SettingsCacheService } from './settings-cache.service';

describe('TimezonePreferenceService', () => {
  let service: TimezonePreferenceService;
  let repository: Repository<TimezonePreference>;

  const mockTimezonePreferenceRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockSettingsCacheService = {
    getSetting: jest.fn(),
    setSetting: jest.fn(),
    clearUserCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimezonePreferenceService,
        {
          provide: getRepositoryToken(TimezonePreference),
          useValue: mockTimezonePreferenceRepository,
        },
        {
          provide: SettingsCacheService,
          useValue: mockSettingsCacheService,
        },
      ],
    }).compile();

    service = module.get<TimezonePreferenceService>(TimezonePreferenceService);
    repository = module.get<Repository<TimezonePreference>>(
      getRepositoryToken(TimezonePreference),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTimezonePreference', () => {
    it('should return existing timezone preference if found', async () => {
      const userId = 'test-user-id';
      const timezonePreference = {
        id: 'timezone-id',
        userId,
        timezone: 'America/New_York',
        autoDetect: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TimezonePreference;

      mockTimezonePreferenceRepository.findOne.mockResolvedValue(timezonePreference);

      const result = await service.getTimezonePreference(userId);

      expect(result).toEqual(timezonePreference);
      expect(mockTimezonePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockTimezonePreferenceRepository.create).not.toHaveBeenCalled();
      expect(mockTimezonePreferenceRepository.save).not.toHaveBeenCalled();
    });

    it('should create default timezone preference if not found', async () => {
      const userId = 'test-user-id';
      const defaultTimezonePreference = {
        userId,
        timezone: 'UTC',
        autoDetect: true,
      } as TimezonePreference;

      mockTimezonePreferenceRepository.findOne.mockResolvedValue(null);
      mockTimezonePreferenceRepository.create.mockReturnValue(defaultTimezonePreference);
      mockTimezonePreferenceRepository.save.mockResolvedValue(defaultTimezonePreference);

      const result = await service.getTimezonePreference(userId);

      expect(result).toEqual(defaultTimezonePreference);
      expect(mockTimezonePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockTimezonePreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        timezone: 'UTC',
        autoDetect: true,
      });
      expect(mockTimezonePreferenceRepository.save).toHaveBeenCalledWith(
        defaultTimezonePreference,
      );
    });
  });

  describe('updateTimezonePreference', () => {
    it('should update existing timezone preference', async () => {
      const userId = 'test-user-id';
      const existingTimezonePreference = {
        id: 'timezone-id',
        userId,
        timezone: 'UTC',
        autoDetect: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TimezonePreference;

      const updateDto: TimezonePreferenceDto = {
        timezone: 'America/New_York',
        autoDetect: false,
      };

      mockTimezonePreferenceRepository.findOne.mockResolvedValue(
        existingTimezonePreference,
      );
      mockTimezonePreferenceRepository.save.mockResolvedValue({
        ...existingTimezonePreference,
        ...updateDto,
      });

      const result = await service.updateTimezonePreference(userId, updateDto);

      expect(result.timezone).toEqual('America/New_York');
      expect(result.autoDetect).toEqual(false);
      expect(mockTimezonePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockTimezonePreferenceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingTimezonePreference,
          ...updateDto,
        }),
      );
    });

    it('should create new timezone preference if not found', async () => {
      const userId = 'test-user-id';
      const updateDto: TimezonePreferenceDto = {
        timezone: 'Europe/London',
        autoDetect: true,
      };

      const newTimezonePreference = {
        userId,
        ...updateDto,
      } as TimezonePreference;

      mockTimezonePreferenceRepository.findOne.mockResolvedValue(null);
      mockTimezonePreferenceRepository.create.mockReturnValue(newTimezonePreference);
      mockTimezonePreferenceRepository.save.mockResolvedValue(newTimezonePreference);

      const result = await service.updateTimezonePreference(userId, updateDto);

      expect(result).toEqual(newTimezonePreference);
      expect(mockTimezonePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockTimezonePreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        ...updateDto,
      });
      expect(mockTimezonePreferenceRepository.save).toHaveBeenCalledWith(
        newTimezonePreference,
      );
    });
  });

  describe('deleteTimezonePreference', () => {
    it('should delete timezone preference if found', async () => {
      const userId = 'test-user-id';
      const timezonePreference = {
        id: 'timezone-id',
        userId,
      } as TimezonePreference;

      mockTimezonePreferenceRepository.findOne.mockResolvedValue(timezonePreference);
      mockTimezonePreferenceRepository.remove.mockResolvedValue(undefined);

      await service.deleteTimezonePreference(userId);

      expect(mockTimezonePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockTimezonePreferenceRepository.remove).toHaveBeenCalledWith(
        timezonePreference,
      );
    });

    it('should throw NotFoundException if timezone preference not found', async () => {
      const userId = 'test-user-id';

      mockTimezonePreferenceRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteTimezonePreference(userId)).rejects.toThrow(
        'Timezone preference not found',
      );

      expect(mockTimezonePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockTimezonePreferenceRepository.remove).not.toHaveBeenCalled();
    });
  });
});