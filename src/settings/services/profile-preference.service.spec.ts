import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfilePreferenceService } from './profile-preference.service';
import { ProfilePreference } from '../entities/profile-preference.entity';
import { ProfilePreferenceDto } from '../dto/profile-preference.dto';
import { FileUploadService } from './file-upload.service';
import { SettingsCacheService } from './settings-cache.service';

describe('ProfilePreferenceService', () => {
  let service: ProfilePreferenceService;
  let repository: Repository<ProfilePreference>;

  const mockProfilePreferenceRepository = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilePreferenceService,
        {
          provide: getRepositoryToken(ProfilePreference),
          useValue: mockProfilePreferenceRepository,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        {
          provide: SettingsCacheService,
          useValue: mockSettingsCacheService,
        },
      ],
    }).compile();

    service = module.get<ProfilePreferenceService>(ProfilePreferenceService);
    repository = module.get<Repository<ProfilePreference>>(
      getRepositoryToken(ProfilePreference),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfilePreference', () => {
    it('should return existing profile preference if found', async () => {
      const userId = 'test-user-id';
      const profilePreference = {
        id: 'profile-id',
        userId,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ProfilePreference;

      mockProfilePreferenceRepository.findOne.mockResolvedValue(profilePreference);

      const result = await service.getProfilePreference(userId);

      expect(result).toEqual(profilePreference);
      expect(mockProfilePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockProfilePreferenceRepository.create).not.toHaveBeenCalled();
      expect(mockProfilePreferenceRepository.save).not.toHaveBeenCalled();
    });

    it('should create default profile preference if not found', async () => {
      const userId = 'test-user-id';
      const defaultProfilePreference = {
        userId,
        firstName: null,
        lastName: null,
        avatarUrl: null,
      } as ProfilePreference;

      mockProfilePreferenceRepository.findOne.mockResolvedValue(null);
      mockProfilePreferenceRepository.create.mockReturnValue(defaultProfilePreference);
      mockProfilePreferenceRepository.save.mockResolvedValue(defaultProfilePreference);

      const result = await service.getProfilePreference(userId);

      expect(result).toEqual(defaultProfilePreference);
      expect(mockProfilePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockProfilePreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        firstName: null,
        lastName: null,
        avatarUrl: null,
      });
      expect(mockProfilePreferenceRepository.save).toHaveBeenCalledWith(
        defaultProfilePreference,
      );
    });
  });

  describe('updateProfilePreference', () => {
    it('should update existing profile preference', async () => {
      const userId = 'test-user-id';
      const existingProfilePreference = {
        id: 'profile-id',
        userId,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ProfilePreference;

      const updateDto: ProfilePreferenceDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockProfilePreferenceRepository.findOne.mockResolvedValue(
        existingProfilePreference,
      );
      mockProfilePreferenceRepository.save.mockResolvedValue({
        ...existingProfilePreference,
        ...updateDto,
      });

      const result = await service.updateProfilePreference(userId, updateDto);

      expect(result.firstName).toEqual('Jane');
      expect(result.lastName).toEqual('Smith');
      expect(mockProfilePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockProfilePreferenceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingProfilePreference,
          ...updateDto,
        }),
      );
    });

    it('should create new profile preference if not found', async () => {
      const userId = 'test-user-id';
      const updateDto: ProfilePreferenceDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const newProfilePreference = {
        userId,
        ...updateDto,
        avatarUrl: null,
      } as ProfilePreference;

      mockProfilePreferenceRepository.findOne.mockResolvedValue(null);
      mockProfilePreferenceRepository.create.mockReturnValue(newProfilePreference);
      mockProfilePreferenceRepository.save.mockResolvedValue(newProfilePreference);

      const result = await service.updateProfilePreference(userId, updateDto);

      expect(result.firstName).toEqual('Jane');
      expect(result.lastName).toEqual('Smith');
      expect(result.avatarUrl).toBeNull();
      expect(mockProfilePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockProfilePreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        ...updateDto,
        avatarUrl: null,
      });
      expect(mockProfilePreferenceRepository.save).toHaveBeenCalledWith(
        newProfilePreference,
      );
    });
  });

  describe('updateAvatarUrl', () => {
    it('should update avatar URL for existing profile preference', async () => {
      const userId = 'test-user-id';
      const existingProfilePreference = {
        id: 'profile-id',
        userId,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/old-avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ProfilePreference;

      const newAvatarUrl = 'https://example.com/new-avatar.jpg';

      mockProfilePreferenceRepository.findOne.mockResolvedValue(
        existingProfilePreference,
      );
      mockProfilePreferenceRepository.save.mockResolvedValue({
        ...existingProfilePreference,
        avatarUrl: newAvatarUrl,
      });

      const result = await service.updateAvatarUrl(userId, newAvatarUrl);

      expect(result.avatarUrl).toEqual(newAvatarUrl);
      expect(mockProfilePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockProfilePreferenceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingProfilePreference,
          avatarUrl: newAvatarUrl,
        }),
      );
    });

    it('should create new profile preference with avatar URL if not found', async () => {
      const userId = 'test-user-id';
      const avatarUrl = 'https://example.com/avatar.jpg';

      const newProfilePreference = {
        userId,
        firstName: null,
        lastName: null,
        avatarUrl,
      } as ProfilePreference;

      mockProfilePreferenceRepository.findOne.mockResolvedValue(null);
      mockProfilePreferenceRepository.create.mockReturnValue(newProfilePreference);
      mockProfilePreferenceRepository.save.mockResolvedValue(newProfilePreference);

      const result = await service.updateAvatarUrl(userId, avatarUrl);

      expect(result.avatarUrl).toEqual(avatarUrl);
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(mockProfilePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockProfilePreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        firstName: null,
        lastName: null,
        avatarUrl,
      });
      expect(mockProfilePreferenceRepository.save).toHaveBeenCalledWith(
        newProfilePreference,
      );
    });
  });

  describe('deleteProfilePreference', () => {
    it('should delete profile preference if found', async () => {
      const userId = 'test-user-id';
      const profilePreference = {
        id: 'profile-id',
        userId,
        avatarUrl: 'https://example.com/avatar.jpg',
      } as ProfilePreference;

      mockProfilePreferenceRepository.findOne.mockResolvedValue(profilePreference);
      mockProfilePreferenceRepository.remove.mockResolvedValue(undefined);
      mockFileUploadService.deleteAvatar.mockResolvedValue(undefined);

      await service.deleteProfilePreference(userId);

      expect(mockProfilePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockProfilePreferenceRepository.remove).toHaveBeenCalledWith(
        profilePreference,
      );
      expect(mockFileUploadService.deleteAvatar).toHaveBeenCalledWith(
        profilePreference.avatarUrl,
      );
    });

    it('should throw NotFoundException if profile preference not found', async () => {
      const userId = 'test-user-id';

      mockProfilePreferenceRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteProfilePreference(userId)).rejects.toThrow(
        'Profile preference not found',
      );

      expect(mockProfilePreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockProfilePreferenceRepository.remove).not.toHaveBeenCalled();
    });
  });
});