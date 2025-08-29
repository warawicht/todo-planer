import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateReminderDto } from '../dto/create-reminder.dto';
import { UpdateReminderDto } from '../dto/update-reminder.dto';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  // In a real implementation, this would inject a ReminderService
  
  @Get()
  async findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 10,
    @Query('userId') userId: string,
  ) {
    // Return reminders for the user
    return { message: 'Get all reminders', userId, skip, take };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    // Return specific reminder
    return { message: 'Get reminder', id, userId };
  }

  @Post()
  async create(
    @Body() createReminderDto: CreateReminderDto,
    @Query('userId') userId: string,
  ) {
    // Create new reminder
    return { message: 'Create reminder', createReminderDto, userId };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
    @Query('userId') userId: string,
  ) {
    // Update reminder
    return { message: 'Update reminder', id, updateReminderDto, userId };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    // Delete reminder
    return { message: 'Delete reminder', id, userId };
  }

  @Post('bulk')
  async bulkCreate(
    @Body() createReminderDtos: CreateReminderDto[],
    @Query('userId') userId: string,
  ) {
    // Bulk create reminders
    return { message: 'Bulk create reminders', createReminderDtos, userId };
  }

  @Put('bulk')
  async bulkUpdate(
    @Body() updateReminderDtos: UpdateReminderDto[],
    @Query('userId') userId: string,
  ) {
    // Bulk update reminders
    return { message: 'Bulk update reminders', updateReminderDtos, userId };
  }

  @Delete('bulk')
  async bulkDelete(
    @Body('ids') ids: string[],
    @Query('userId') userId: string,
  ) {
    // Bulk delete reminders
    return { message: 'Bulk delete reminders', ids, userId };
  }
}