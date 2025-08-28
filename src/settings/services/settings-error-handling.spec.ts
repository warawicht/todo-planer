import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemePreferenceService } from './theme-preference.service';
import { TimezonePreferenceService } from './timezone-preference.service';
import { ProfilePreferenceService } from './profile-preference.service';
import { DataExportService } from './data-export.service';
import { ThemePreference } from '../entities/theme-preference.entity';
import { TimezonePreference } from '../entities/timezone-preference.entity';
import { ProfilePreference } from '../entities/profile-preference.entity';
import { DataExport } from '../entities/data-export.entity';
import { ThemePreferenceDto } from '../dto/theme-preference.dto';
import { TimezonePreferenceDto } from '../dto/timezone-preference.dto';
import { ProfilePreferenceDto } from '../dto/profile-preference.dto';
import { FileUploadService } from './file-upload.service';
import { SettingsCacheService } from './settings-cache.service';
import { TasksService } from '../../tasks/tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { TimeBlocksService } from '../../time-blocks/time-blocks.service';

describe('Settings Services Error Handling', () => {
  let themeService: ThemePreferenceService;
  let timezoneService: TimezonePreferenceService;
  let profileService: ProfilePreferenceService;
  let dataExportService: DataExportService;

  const mockThemePreferenceRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTimezonePreferenceRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockProfilePreferenceRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockDataExportRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockFileUploadService = {
    deleteAvatar: jest.fn(),
  };

  const mockSettingsCacheService = {
    getSetting: jest.fn(),
    setSetting: jest.fn(),
    clearUserCache: jest.fn(),
  };

  const mockTasksService = {
    findAll: jest.fn(),
  };

  const mockProjectsService = {
    findAll: jest.fn(),
  };

  const mockTimeBlocksService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemePreferenceService,
        TimezonePreferenceService,
        ProfilePreferenceService,
        DataExportService,
        {
          provide: getRepositoryToken(ThemePreference),
          useValue: mockThemePreferenceRepository,
        },
        {
          provide: getRepositoryToken(TimezonePreference),
          useValue: mockTimezonePreferenceRepository,
        },
        {
          provide: getRepositoryToken(ProfilePreference),
          useValue: mockProfilePreferenceRepository,
        },
        {
          provide: getRepositoryToken(DataExport),
          useValue: mockDataExportRepository,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        {
          provide: SettingsCacheService,
          useValue: mockSettingsCacheService,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: TimeBlocksService,
          useValue: mockTimeBlocksService,
        },
      ],
    }).compile();

    themeService = module.get<ThemePreferenceService>(ThemePreferenceService);
    timezoneService = module.get<TimezonePreferenceService>(TimezonePreferenceService);
    profileService = module.get<ProfilePreferenceService>(ProfilePreferenceService);
    dataExportService = module.get<DataExportService>(DataExportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Error Handling', () => {
    const userId = 'test-user-id';
    const exportId = 'export-id';

    it('should handle database errors in ThemePreferenceService', async () => {
      const error = new Error('Database connection failed');
      mockThemePreferenceRepository.findOne.mockRejectedValue(error);

      await expect(themeService.getThemePreference(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle database errors in TimezonePreferenceService', async () => {
      const error = new Error('Database connection failed');
      mockTimezonePreferenceRepository.findOne.mockRejectedValue(error);

      await expect(timezoneService.getTimezonePreference(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle database errors in ProfilePreferenceService', async () => {
      const error = new Error('Database connection failed');
      mockProfilePreferenceRepository.findOne.mockRejectedValue(error);

      await expect(profileService.getProfilePreference(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle database errors in DataExportService', async () => {
      const error = new Error('Database connection failed');
      mockDataExportRepository.findOne.mockRejectedValue(error);

      await expect(dataExportService.getDataExport(exportId, userId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('Validation Error Handling', () => {
    const userId = 'test-user-id';

    it('should handle validation errors in ThemePreferenceService update', async () => {
      const updateDto: ThemePreferenceDto = {
        theme: 'invalid-theme' as any, // Invalid theme value
        accentColor: 'invalid-color', // Invalid color format
      };

      // The service doesn't validate directly, but we can test error propagation
      const error = new Error('Validation failed');
      mockThemePreferenceRepository.findOne.mockResolvedValue({
        id: 'theme-id',
        userId,
      } as ThemePreference);
      mockThemePreferenceRepository.save.mockRejectedValue(error);

      await expect(
        themeService.updateThemePreference(userId, updateDto),
      ).rejects.toThrow('Validation failed');
    });

    it('should handle validation errors in TimezonePreferenceService update', async () => {
      const updateDto: TimezonePreferenceDto = {
        timezone: 'invalid/timezone', // Invalid timezone format
      };

      // The service doesn't validate directly, but we can test error propagation
      const error = new Error('Validation failed');
      mockTimezonePreferenceRepository.findOne.mockResolvedValue({
        id: 'timezone-id',
        userId,
      } as TimezonePreference);
      mockTimezonePreferenceRepository.save.mockRejectedValue(error);

      await expect(
        timezoneService.updateTimezonePreference(userId, updateDto),
      ).rejects.toThrow('Validation failed');
    });

    it('should handle validation errors in ProfilePreferenceService update', async () => {
      const updateDto: ProfilePreferenceDto = {
        firstName: 'A'.repeat(100), // Too long
        lastName: 'B'.repeat(100), // Too long
      };

      // The service doesn't validate directly, but we can test error propagation
      const error = new Error('Validation failed');
      mockProfilePreferenceRepository.findOne.mockResolvedValue({
        id: 'profile-id',
        userId,
      } as ProfilePreference);
      mockProfilePreferenceRepository.save.mockRejectedValue(error);

      await expect(
        profileService.updateProfilePreference(userId, updateDto),
      ).rejects.toThrow('Validation failed');
    });
  });
});