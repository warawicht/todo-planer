import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CalendarViewPreferenceDto } from './dto/calendar-view-preference.dto';
import { CalendarViewPreferenceResponseDto } from './dto/calendar-view-preference-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('preferences/calendar-view')
  async getCalendarViewPreferences(
    @Request() req,
  ): Promise<CalendarViewPreferenceResponseDto> {
    return this.usersService.getCalendarViewPreferences(req.user.id);
  }

  @Post('preferences/calendar-view')
  async updateCalendarViewPreferences(
    @Request() req,
    @Body() preferenceDto: CalendarViewPreferenceDto,
  ): Promise<CalendarViewPreferenceResponseDto> {
    return this.usersService.updateCalendarViewPreferences(
      req.user.id,
      preferenceDto,
    );
  }
}