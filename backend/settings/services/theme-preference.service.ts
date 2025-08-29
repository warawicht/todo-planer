import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemePreference } from '../entities/theme-preference.entity';
import { ThemePreferenceDto } from '../dto/theme-preference.dto';
import { User } from '../../users/user.entity';
import { SettingsCacheService } from './settings-cache.service';

@Injectable()
export class ThemePreferenceService {
  constructor(
    @InjectRepository(ThemePreference)
    private themePreferenceRepository: Repository<ThemePreference>,
    private settingsCacheService: SettingsCacheService,
  ) {}

  async getThemePreference(userId: string): Promise<ThemePreference> {
    // Try to get from cache first
    const cachedPreference = this.settingsCacheService.getSetting(userId, 'theme');
    if (cachedPreference) {
      return cachedPreference;
    }

    let themePreference = await this.themePreferenceRepository.findOne({
      where: { userId },
    });

    if (!themePreference) {
      // Create default theme preference if it doesn't exist
      themePreference = this.themePreferenceRepository.create({
        userId,
        theme: 'system',
        accentColor: '#4a76d4',
        highContrastMode: false,
      });
      themePreference = await this.themePreferenceRepository.save(themePreference);
    }

    // Cache the result
    this.settingsCacheService.setSetting(userId, 'theme', themePreference);

    return themePreference;
  }

  async updateThemePreference(
    userId: string,
    themePreferenceDto: ThemePreferenceDto,
  ): Promise<ThemePreference> {
    let themePreference = await this.themePreferenceRepository.findOne({
      where: { userId },
    });

    if (!themePreference) {
      // Create new theme preference if it doesn't exist
      themePreference = this.themePreferenceRepository.create({
        userId,
        ...themePreferenceDto,
      });
    } else {
      // Update existing theme preference
      Object.assign(themePreference, themePreferenceDto);
    }

    const savedPreference = await this.themePreferenceRepository.save(themePreference);
    
    // Update cache
    this.settingsCacheService.setSetting(userId, 'theme', savedPreference);
    
    return savedPreference;
  }

  async deleteThemePreference(userId: string): Promise<void> {
    const themePreference = await this.themePreferenceRepository.findOne({
      where: { userId },
    });

    if (!themePreference) {
      throw new NotFoundException('Theme preference not found');
    }

    await this.themePreferenceRepository.remove(themePreference);
    
    // Clear cache
    this.settingsCacheService.clearUserCache(userId);
  }
}