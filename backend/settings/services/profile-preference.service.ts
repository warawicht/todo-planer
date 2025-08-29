import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfilePreference } from '../entities/profile-preference.entity';
import { ProfilePreferenceDto } from '../dto/profile-preference.dto';
import { User } from '../../users/user.entity';
import { FileUploadService } from './file-upload.service';
import { SettingsCacheService } from './settings-cache.service';

@Injectable()
export class ProfilePreferenceService {
  constructor(
    @InjectRepository(ProfilePreference)
    private profilePreferenceRepository: Repository<ProfilePreference>,
    private fileUploadService: FileUploadService,
    private settingsCacheService: SettingsCacheService,
  ) {}

  async getProfilePreference(userId: string): Promise<ProfilePreference> {
    // Try to get from cache first
    const cachedPreference = this.settingsCacheService.getSetting(userId, 'profile');
    if (cachedPreference) {
      return cachedPreference;
    }

    let profilePreference = await this.profilePreferenceRepository.findOne({
      where: { userId },
    });

    if (!profilePreference) {
      // Create default profile preference if it doesn't exist
      const preferenceData = {
        userId,
        firstName: undefined,
        lastName: undefined,
        avatarUrl: undefined,
      };
      profilePreference = this.profilePreferenceRepository.create(preferenceData);
      profilePreference = await this.profilePreferenceRepository.save(profilePreference);
    }

    // Cache the result
    this.settingsCacheService.setSetting(userId, 'profile', profilePreference);

    return profilePreference;
  }

  async updateProfilePreference(
    userId: string,
    profilePreferenceDto: ProfilePreferenceDto,
  ): Promise<ProfilePreference> {
    let profilePreference = await this.profilePreferenceRepository.findOne({
      where: { userId },
    });

    if (!profilePreference) {
      // Create new profile preference if it doesn't exist
      const preferenceData = {
        userId,
        firstName: profilePreferenceDto.firstName,
        lastName: profilePreferenceDto.lastName,
        avatarUrl: undefined, // Avatar URL will be set separately
      };
      profilePreference = this.profilePreferenceRepository.create(preferenceData);
    } else {
      // Update existing profile preference
      Object.assign(profilePreference, profilePreferenceDto);
    }

    const savedPreference = await this.profilePreferenceRepository.save(profilePreference);
    
    // Update cache
    this.settingsCacheService.setSetting(userId, 'profile', savedPreference);
    
    return savedPreference;
  }

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<ProfilePreference> {
    let profilePreference = await this.profilePreferenceRepository.findOne({
      where: { userId },
    });

    if (!profilePreference) {
      // Create new profile preference if it doesn't exist
      const preferenceData = {
        userId,
        firstName: undefined,
        lastName: undefined,
        avatarUrl,
      };
      profilePreference = this.profilePreferenceRepository.create(preferenceData);
    } else {
      // Update avatar URL
      profilePreference.avatarUrl = avatarUrl;
    }

    const savedPreference = await this.profilePreferenceRepository.save(profilePreference);
    
    // Update cache
    this.settingsCacheService.setSetting(userId, 'profile', savedPreference);
    
    return savedPreference;
  }

  async deleteProfilePreference(userId: string): Promise<void> {
    const profilePreference = await this.profilePreferenceRepository.findOne({
      where: { userId },
    });

    if (!profilePreference) {
      throw new NotFoundException('Profile preference not found');
    }

    // Delete avatar file if it exists
    if (profilePreference.avatarUrl) {
      await this.fileUploadService.deleteAvatar(profilePreference.avatarUrl);
    }

    await this.profilePreferenceRepository.remove(profilePreference);
    
    // Clear cache
    this.settingsCacheService.clearUserCache(userId);
  }
}