import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationPreferenceDto } from '../dto/notification-preference.dto';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreference)
    private notificationPreferenceRepository: Repository<NotificationPreference>,
  ) {}

  async findOne(userId: string): Promise<NotificationPreference> {
    let preference = await this.notificationPreferenceRepository.findOne({
      where: { userId },
    });

    // If no preference exists, create default preferences
    if (!preference) {
      preference = this.notificationPreferenceRepository.create({
        userId,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        taskRemindersEnabled: true,
        timeBlockAlertsEnabled: true,
        deadlineWarningsEnabled: true,
        productivitySummariesEnabled: true,
        systemAlertsEnabled: true,
      });
      await this.notificationPreferenceRepository.save(preference);
    }

    return preference;
  }

  async update(userId: string, preferenceDto: NotificationPreferenceDto): Promise<NotificationPreference> {
    let preference = await this.notificationPreferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      preference = this.notificationPreferenceRepository.create({
        userId,
        ...preferenceDto,
      });
    } else {
      Object.assign(preference, preferenceDto);
    }

    return this.notificationPreferenceRepository.save(preference);
  }
}