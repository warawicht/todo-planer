import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { TimeTrackingService } from '../services/time-tracking.service';
import { TimeEntryDto } from '../dto/time-entry.dto';
import { ProductivityException } from '../exceptions/productivity.exception';

@Controller('productivity/time-entries')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  /**
   * Create a new time entry
   */
  @Post()
  async createTimeEntry(@Body() timeEntryDto: TimeEntryDto) {
    try {
      const timeEntry = await this.timeTrackingService.createTimeEntry(timeEntryDto);
      return timeEntry;
    } catch (error) {
      throw new ProductivityException(`Failed to create time entry: ${error.message}`);
    }
  }

  /**
   * Retrieve time entries for a given date range
   */
  @Get()
  async getTimeEntries(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
    @Query('taskId', ParseUUIDPipe) taskId?: string,
  ) {
    try {
      if (!userId || !startDate || !endDate) {
        throw new ProductivityException('userId, startDate, and endDate are required');
      }

      if (taskId) {
        return await this.timeTrackingService.getTimeEntriesForTask(taskId, userId);
      } else {
        return await this.timeTrackingService.getTimeEntriesForDateRange(userId, startDate, endDate);
      }
    } catch (error) {
      throw new ProductivityException(`Failed to retrieve time entries: ${error.message}`);
    }
  }

  /**
   * Update a time entry
   */
  @Put(':id')
  async updateTimeEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
    @Body() timeEntryDto: TimeEntryDto,
  ) {
    try {
      const timeEntry = await this.timeTrackingService.updateTimeEntry(id, userId, timeEntryDto);
      return timeEntry;
    } catch (error) {
      throw new ProductivityException(`Failed to update time entry: ${error.message}`);
    }
  }

  /**
   * Delete a time entry
   */
  @Delete(':id')
  async deleteTimeEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.timeTrackingService.deleteTimeEntry(id, userId);
      return { message: 'Time entry deleted successfully' };
    } catch (error) {
      throw new ProductivityException(`Failed to delete time entry: ${error.message}`);
    }
  }
}