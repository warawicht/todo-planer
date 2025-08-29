import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimezonePreference } from '../entities/timezone-preference.entity';
import { TimezonePreferenceDto } from '../dto/timezone-preference.dto';
import { User } from '../../users/user.entity';
import { SettingsCacheService } from './settings-cache.service';

@Injectable()
export class TimezonePreferenceService {
  constructor(
    @InjectRepository(TimezonePreference)
    private timezonePreferenceRepository: Repository<TimezonePreference>,
    private settingsCacheService: SettingsCacheService,
  ) {}

  async getTimezonePreference(userId: string): Promise<TimezonePreference> {
    // Try to get from cache first
    const cachedPreference = this.settingsCacheService.getSetting(userId, 'timezone');
    if (cachedPreference) {
      return cachedPreference;
    }

    let timezonePreference = await this.timezonePreferenceRepository.findOne({
      where: { userId },
    });

    if (!timezonePreference) {
      // Create default timezone preference if it doesn't exist
      timezonePreference = this.timezonePreferenceRepository.create({
        userId,
        timezone: 'UTC',
        autoDetect: true,
      });
      timezonePreference = await this.timezonePreferenceRepository.save(timezonePreference);
    }

    // Cache the result
    this.settingsCacheService.setSetting(userId, 'timezone', timezonePreference);

    return timezonePreference;
  }

  async updateTimezonePreference(
    userId: string,
    timezonePreferenceDto: TimezonePreferenceDto,
  ): Promise<TimezonePreference> {
    let timezonePreference = await this.timezonePreferenceRepository.findOne({
      where: { userId },
    });

    if (!timezonePreference) {
      // Create new timezone preference if it doesn't exist
      timezonePreference = this.timezonePreferenceRepository.create({
        userId,
        ...timezonePreferenceDto,
      });
    } else {
      // Update existing timezone preference
      Object.assign(timezonePreference, timezonePreferenceDto);
    }

    const savedPreference = await this.timezonePreferenceRepository.save(timezonePreference);
    
    // Update cache
    this.settingsCacheService.setSetting(userId, 'timezone', savedPreference);
    
    return savedPreference;
  }

  async deleteTimezonePreference(userId: string): Promise<void> {
    const timezonePreference = await this.timezonePreferenceRepository.findOne({
      where: { userId },
    });

    if (!timezonePreference) {
      throw new NotFoundException('Timezone preference not found');
    }

    await this.timezonePreferenceRepository.remove(timezonePreference);
    
    // Clear cache
    this.settingsCacheService.clearUserCache(userId);
  }
}