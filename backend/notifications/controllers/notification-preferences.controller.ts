import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NotificationPreferenceDto } from '../dto/notification-preference.dto';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { QuietHoursService } from '../services/quiet-hours.service';

@Controller('notification-preferences')
@UseGuards(JwtAuthGuard)
export class NotificationPreferencesController {
  constructor(
    private readonly notificationPreferenceService: NotificationPreferenceService,
    private readonly quietHoursService: QuietHoursService,
  ) {}
  
  @Get()
  async findOne(@Query('userId') userId: string) {
    return this.notificationPreferenceService.findOne(userId);
  }

  @Put()
  async update(
    @Body() notificationPreferenceDto: NotificationPreferenceDto,
    @Query('userId') userId: string,
  ) {
    return this.notificationPreferenceService.update(userId, notificationPreferenceDto);
  }

  @Get('quiet-hours-status')
  async getQuietHoursStatus(@Query('userId') userId: string) {
    const preferences = await this.notificationPreferenceService.findOne(userId);
    const feedback = this.quietHoursService.getQuietHoursFeedback(preferences);
    const isWithinQuietHours = this.quietHoursService.isWithinQuietHours(preferences);
    
    return {
      isWithinQuietHours,
      feedback,
      quietHoursEnabled: preferences.quietHoursEnabled,
      quietHoursStart: preferences.quietHoursStart,
      quietHoursEnd: preferences.quietHoursEnd,
    };
  }
}