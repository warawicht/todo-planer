import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { TimezonePreferenceService } from '../services/timezone-preference.service';
import { TimezonePreferenceDto, TimezonePreferenceResponseDto } from '../dto/timezone-preference.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('settings/timezone')
@UseGuards(JwtAuthGuard)
export class TimezonePreferenceController {
  constructor(private readonly timezonePreferenceService: TimezonePreferenceService) {}

  @Get()
  async getTimezonePreference(@Request() req): Promise<TimezonePreferenceResponseDto> {
    const timezonePreference = await this.timezonePreferenceService.getTimezonePreference(req.user.id);
    return {
      timezone: timezonePreference.timezone,
      autoDetect: timezonePreference.autoDetect,
      updatedAt: timezonePreference.updatedAt,
    };
  }

  @Put()
  async updateTimezonePreference(
    @Request() req,
    @Body() timezonePreferenceDto: TimezonePreferenceDto,
  ): Promise<TimezonePreferenceResponseDto> {
    const timezonePreference = await this.timezonePreferenceService.updateTimezonePreference(
      req.user.id,
      timezonePreferenceDto,
    );
    return {
      timezone: timezonePreference.timezone,
      autoDetect: timezonePreference.autoDetect,
      updatedAt: timezonePreference.updatedAt,
    };
  }
}