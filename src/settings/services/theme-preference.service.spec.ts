import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemePreferenceService } from './theme-preference.service';
import { ThemePreference } from '../entities/theme-preference.entity';
import { ThemePreferenceDto } from '../dto/theme-preference.dto';
import { SettingsCacheService } from './settings-cache.service';

describe('ThemePreferenceService', () => {
  let service: ThemePreferenceService;
  let repository: Repository<ThemePreference>;
  let cacheService: SettingsCacheService;

  const mockThemePreferenceRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockCacheService = {
    getSetting: jest.fn(),
    setSetting: jest.fn(),
    clearUserCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemePreferenceService,
        {
          provide: getRepositoryToken(ThemePreference),
          useValue: mockThemePreferenceRepository,
        },
        {
          provide: SettingsCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<ThemePreferenceService>(ThemePreferenceService);
    repository = module.get<Repository<ThemePreference>>(
      getRepositoryToken(ThemePreference),
    );
    cacheService = module.get<SettingsCacheService>(SettingsCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getThemePreference', () => {
    it('should return theme preference from cache if available', async () => {
      const userId = 'test-user-id';
      const cachedPreference = {
        id: 'theme-id',
        userId,
        theme: 'dark',
        accentColor: '#ff0000',
        highContrastMode: false,
      } as ThemePreference;

      mockCacheService.getSetting.mockReturnValue(cachedPreference);

      const result = await service.getThemePreference(userId);

      expect(result).toEqual(cachedPreference);
      expect(mockCacheService.getSetting).toHaveBeenCalledWith(userId, 'theme');
      expect(mockThemePreferenceRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return theme preference from database if not in cache', async () => {
      const userId = 'test-user-id';
      const themePreference = {
        id: 'theme-id',
        userId,
        theme: 'dark',
        accentColor: '#ff0000',
        highContrastMode: false,
      } as ThemePreference;

      mockCacheService.getSetting.mockReturnValue(null);
      mockThemePreferenceRepository.findOne.mockResolvedValue(themePreference);

      const result = await service.getThemePreference(userId);

      expect(result).toEqual(themePreference);
      expect(mockCacheService.getSetting).toHaveBeenCalledWith(userId, 'theme');
      expect(mockThemePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockCacheService.setSetting).toHaveBeenCalledWith(userId, 'theme', themePreference);
    });

    it('should create default theme preference if not found', async () => {
      const userId = 'test-user-id';
      const defaultThemePreference = {
        userId,
        theme: 'system',
        accentColor: '#4a76d4',
        highContrastMode: false,
      } as ThemePreference;

      const savedThemePreference = {
        id: 'theme-id',
        ...defaultThemePreference,
      } as ThemePreference;

      mockCacheService.getSetting.mockReturnValue(null);
      mockThemePreferenceRepository.findOne.mockResolvedValue(null);
      mockThemePreferenceRepository.create.mockReturnValue(defaultThemePreference);
      mockThemePreferenceRepository.save.mockResolvedValue(savedThemePreference);

      const result = await service.getThemePreference(userId);

      expect(result).toEqual(savedThemePreference);
      expect(mockThemePreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        theme: 'system',
        accentColor: '#4a76d4',
        highContrastMode: false,
      });
      expect(mockThemePreferenceRepository.save).toHaveBeenCalledWith(defaultThemePreference);
      expect(mockCacheService.setSetting).toHaveBeenCalledWith(userId, 'theme', savedThemePreference);
    });
  });

  describe('updateThemePreference', () => {
    it('should update existing theme preference', async () => {
      const userId = 'test-user-id';
      const updateDto: ThemePreferenceDto = {
        theme: 'dark',
        accentColor: '#00ff00',
        highContrastMode: true,
      };

      const existingThemePreference = {
        id: 'theme-id',
        userId,
        theme: 'light',
        accentColor: '#ff0000',
        highContrastMode: false,
      } as ThemePreference;

      const updatedThemePreference = {
        ...existingThemePreference,
        ...updateDto,
      } as ThemePreference;

      mockThemePreferenceRepository.findOne.mockResolvedValue(existingThemePreference);
      mockThemePreferenceRepository.save.mockResolvedValue(updatedThemePreference);

      const result = await service.updateThemePreference(userId, updateDto);

      expect(result).toEqual(updatedThemePreference);
      expect(mockThemePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockThemePreferenceRepository.save).toHaveBeenCalledWith(updatedThemePreference);
      expect(mockCacheService.setSetting).toHaveBeenCalledWith(userId, 'theme', updatedThemePreference);
    });

    it('should create new theme preference if not found', async () => {
      const userId = 'test-user-id';
      const updateDto: ThemePreferenceDto = {
        theme: 'dark',
        accentColor: '#00ff00',
        highContrastMode: true,
      };

      const newThemePreference = {
        userId,
        ...updateDto,
      } as ThemePreference;

      const savedThemePreference = {
        id: 'theme-id',
        ...newThemePreference,
      } as ThemePreference;

      mockThemePreferenceRepository.findOne.mockResolvedValue(null);
      mockThemePreferenceRepository.create.mockReturnValue(newThemePreference);
      mockThemePreferenceRepository.save.mockResolvedValue(savedThemePreference);

      const result = await service.updateThemePreference(userId, updateDto);

      expect(result).toEqual(savedThemePreference);
      expect(mockThemePreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        ...updateDto,
      });
      expect(mockThemePreferenceRepository.save).toHaveBeenCalledWith(newThemePreference);
      expect(mockCacheService.setSetting).toHaveBeenCalledWith(userId, 'theme', savedThemePreference);
    });
  });

  describe('deleteThemePreference', () => {
    it('should delete theme preference if found', async () => {
      const userId = 'test-user-id';
      const themePreference = {
        id: 'theme-id',
        userId,
      } as ThemePreference;

      mockThemePreferenceRepository.findOne.mockResolvedValue(themePreference);
      mockThemePreferenceRepository.remove.mockResolvedValue(undefined);

      await service.deleteThemePreference(userId);

      expect(mockThemePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockThemePreferenceRepository.remove).toHaveBeenCalledWith(themePreference);
      expect(mockCacheService.clearUserCache).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if theme preference not found when deleting', async () => {
      const userId = 'test-user-id';

      mockThemePreferenceRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteThemePreference(userId)).rejects.toThrow(
        'Theme preference not found',
      );

      expect(mockThemePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockThemePreferenceRepository.remove).not.toHaveBeenCalled();
      expect(mockCacheService.clearUserCache).not.toHaveBeenCalled();
    });
  });
});