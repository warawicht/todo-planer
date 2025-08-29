import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TimeBlocksService } from './time-blocks.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { TimeBlockQueryDto } from './dto/time-block-query.dto';
import { CalendarViewQueryDto } from './dto/calendar-view.dto';
import { CalendarViewResponseDto } from './dto/calendar-view-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('time-blocks')
@UseGuards(JwtAuthGuard)
export class TimeBlocksController {
  constructor(private readonly timeBlocksService: TimeBlocksService) {}

  @Post()
  async create(@Request() req, @Body() createTimeBlockDto: CreateTimeBlockDto) {
    return this.timeBlocksService.create(req.user.id, createTimeBlockDto);
  }

  @Get()
  async findAll(@Request() req, @Query() query: TimeBlockQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    return this.timeBlocksService.findAll(req.user.id, startDate, endDate);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.timeBlocksService.findOne(req.user.id, id);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTimeBlockDto: UpdateTimeBlockDto,
  ) {
    return this.timeBlocksService.update(req.user.id, id, updateTimeBlockDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.timeBlocksService.remove(req.user.id, id);
    return { message: 'Time block deleted successfully' };
  }

  @Get('calendar')
  async getCalendarView(
    @Request() req,
    @Query() query: CalendarViewQueryDto,
  ): Promise<CalendarViewResponseDto> {
    const referenceDate = new Date(query.date);
    return this.timeBlocksService.getCalendarView(
      req.user.id,
      query.view,
      referenceDate,
    );
  }
}