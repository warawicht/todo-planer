import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { CalendarViewPreference } from './entities/calendar-view-preference.entity';
import { CalendarViewPreferenceDto } from './dto/calendar-view-preference.dto';
import { CalendarViewPreferenceResponseDto } from './dto/calendar-view-preference-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(CalendarViewPreference)
    private calendarViewPreferenceRepository: Repository<CalendarViewPreference>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user || undefined;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findByEmailVerificationToken(token: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ 
      where: { 
        emailVerificationToken: token 
      } 
    });
    return user || undefined;
  }

  async findByPasswordResetToken(token: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ 
      where: { 
        passwordResetToken: token 
      } 
    });
    return user || undefined;
  }

  async findOne(options: any): Promise<User | undefined> {
    const user = await this.usersRepository.findOne(options);
    return user || undefined;
  }

  /**
   * Get user's calendar view preferences
   * @param userId The user ID
   * @returns Calendar view preferences
   */
  async getCalendarViewPreferences(userId: string): Promise<CalendarViewPreferenceResponseDto> {
    // Try to find existing preferences
    let preference = await this.calendarViewPreferenceRepository.findOne({ 
      where: { userId },
      relations: ['user']
    });
    
    // If no preferences exist, create default ones
    if (!preference) {
      preference = this.calendarViewPreferenceRepository.create({
        userId,
        defaultView: 'week',
        firstDayOfWeek: 0,
        showWeekends: true,
        timeFormat: '12h',
      });
      preference = await this.calendarViewPreferenceRepository.save(preference);
    }
    
    return {
      defaultView: preference.defaultView,
      firstDayOfWeek: preference.firstDayOfWeek,
      showWeekends: preference.showWeekends,
      timeFormat: preference.timeFormat,
      updatedAt: preference.updatedAt,
    };
  }

  /**
   * Update user's calendar view preferences
   * @param userId The user ID
   * @param preferenceDto The preference data
   * @returns Updated calendar view preferences
   */
  async updateCalendarViewPreferences(
    userId: string, 
    preferenceDto: CalendarViewPreferenceDto
  ): Promise<CalendarViewPreferenceResponseDto> {
    // Try to find existing preferences
    let preference = await this.calendarViewPreferenceRepository.findOne({ 
      where: { userId },
      relations: ['user']
    });
    
    // If no preferences exist, create new ones
    if (!preference) {
      preference = this.calendarViewPreferenceRepository.create({
        userId,
        defaultView: preferenceDto.defaultView || 'week',
        firstDayOfWeek: preferenceDto.firstDayOfWeek !== undefined ? preferenceDto.firstDayOfWeek : 0,
        showWeekends: preferenceDto.showWeekends !== undefined ? preferenceDto.showWeekends : true,
        timeFormat: preferenceDto.timeFormat || '12h',
      });
    } else {
      // Update existing preferences
      if (preferenceDto.defaultView !== undefined) {
        preference.defaultView = preferenceDto.defaultView;
      }
      if (preferenceDto.firstDayOfWeek !== undefined) {
        preference.firstDayOfWeek = preferenceDto.firstDayOfWeek;
      }
      if (preferenceDto.showWeekends !== undefined) {
        preference.showWeekends = preferenceDto.showWeekends;
      }
      if (preferenceDto.timeFormat !== undefined) {
        preference.timeFormat = preferenceDto.timeFormat;
      }
    }
    
    // Save the preferences
    preference = await this.calendarViewPreferenceRepository.save(preference);
    
    return {
      defaultView: preference.defaultView,
      firstDayOfWeek: preference.firstDayOfWeek,
      showWeekends: preference.showWeekends,
      timeFormat: preference.timeFormat,
      updatedAt: preference.updatedAt,
    };
  }
}