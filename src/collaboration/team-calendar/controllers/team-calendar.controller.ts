import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TeamCalendarService } from '../services/team-calendar.service';
import { CalendarQueryDto } from '../dto/calendar-query.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@Controller('api/calendar')
@UseGuards(JwtAuthGuard)
export class TeamCalendarController {
  constructor(private readonly teamCalendarService: TeamCalendarService) {}

  @Get('team')
  async getTeamCalendar(
    @Query() query: CalendarQueryDto,
    @Request() req,
  ) {
    // If no userIds provided, default to just the current user
    const userIds = query.userIds && query.userIds.length > 0 
      ? query.userIds 
      : [req.user.id];

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.teamCalendarService.getTeamCalendarData(
      userIds,
      startDate,
      endDate,
      query.page,
      query.limit,
      query.search
    );
  }

  @Get('user/:userId')
  async getUserCalendar(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: CalendarQueryDto,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.teamCalendarService.getUserCalendarData(
      userId,
      startDate,
      endDate,
      query.page,
      query.limit,
      query.search
    );
  }

  @Get('me')
  async getMyCalendar(
    @Query() query: CalendarQueryDto,
    @Request() req,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.teamCalendarService.getUserCalendarData(
      req.user.id,
      startDate,
      endDate,
      query.page,
      query.limit,
      query.search
    );
  }
}