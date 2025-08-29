import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { TimeEntryDto } from '../dto/time-entry.dto';
import { Task } from '../../tasks/entities/task.entity';
import { ProductivityException } from '../exceptions/productivity.exception';

@Injectable()
export class TimeTrackingService {
  private readonly logger = new Logger(TimeTrackingService.name);

  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Start time tracking for a task
   */
  async startTimeTracking(userId: string, taskId?: string, description?: string): Promise<TimeEntry> {
    try {
      // Check if task exists
      if (taskId) {
        const task = await this.taskRepository.findOne({
          where: { id: taskId, userId },
        });

        if (!task) {
          throw new ProductivityException('Task not found or does not belong to user');
        }
      }

      // Create a new time entry
      const timeEntry = this.timeEntryRepository.create({
        userId,
        taskId,
        startTime: new Date(),
        isManual: false,
        description,
      });

      return await this.timeEntryRepository.save(timeEntry);
    } catch (error) {
      this.logger.error(`Error starting time tracking for user ${userId}: ${error.message}`);
      throw new ProductivityException(`Failed to start time tracking: ${error.message}`);
    }
  }

  /**
   * Stop time tracking and calculate duration
   */
  async stopTimeTracking(entryId: string, userId: string): Promise<TimeEntry> {
    try {
      // Find the time entry
      const timeEntry = await this.timeEntryRepository.findOne({
        where: { id: entryId, userId },
      });

      if (!timeEntry) {
        throw new ProductivityException('Time entry not found or does not belong to user');
      }

      if (timeEntry.endTime) {
        throw new ProductivityException('Time entry already stopped');
      }

      // Set end time and calculate duration
      timeEntry.endTime = new Date();
      timeEntry.duration = Math.floor((timeEntry.endTime.getTime() - timeEntry.startTime.getTime()) / 1000);

      return await this.timeEntryRepository.save(timeEntry);
    } catch (error) {
      this.logger.error(`Error stopping time tracking for entry ${entryId}: ${error.message}`);
      throw new ProductivityException(`Failed to stop time tracking: ${error.message}`);
    }
  }

  /**
   * Create a manual time entry
   */
  async createTimeEntry(timeEntryDto: TimeEntryDto): Promise<TimeEntry> {
    try {
      // Check if task exists
      if (timeEntryDto.taskId) {
        const task = await this.taskRepository.findOne({
          where: { id: timeEntryDto.taskId, userId: timeEntryDto.userId },
        });

        if (!task) {
          throw new ProductivityException('Task not found or does not belong to user');
        }
      }

      // Validate time range
      if (timeEntryDto.startTime && timeEntryDto.endTime) {
        if (timeEntryDto.startTime >= timeEntryDto.endTime) {
          throw new ProductivityException('End time must be after start time');
        }

        // Calculate duration if not provided
        if (!timeEntryDto.duration) {
          timeEntryDto.duration = Math.floor(
            (timeEntryDto.endTime.getTime() - timeEntryDto.startTime.getTime()) / 1000,
          );
        }
      }

      const timeEntry = this.timeEntryRepository.create({
        ...timeEntryDto,
        isManual: true,
      });

      return await this.timeEntryRepository.save(timeEntry);
    } catch (error) {
      this.logger.error(`Error creating time entry: ${error.message}`);
      throw new ProductivityException(`Failed to create time entry: ${error.message}`);
    }
  }

  /**
   * Get time entries for a task
   */
  async getTimeEntriesForTask(taskId: string, userId: string): Promise<TimeEntry[]> {
    try {
      return await this.timeEntryRepository.find({
        where: { taskId, userId },
        order: { startTime: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error retrieving time entries for task ${taskId}: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve time entries: ${error.message}`);
    }
  }

  /**
   * Get time entries for a date range
   */
  async getTimeEntriesForDateRange(userId: string, startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    try {
      return await this.timeEntryRepository.find({
        where: {
          userId,
          startTime: startDate,
        },
        order: { startTime: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error retrieving time entries for date range: ${error.message}`);
      throw new ProductivityException(`Failed to retrieve time entries: ${error.message}`);
    }
  }

  /**
   * Update a time entry
   */
  async updateTimeEntry(entryId: string, userId: string, timeEntryDto: TimeEntryDto): Promise<TimeEntry> {
    try {
      // Find the time entry
      const timeEntry = await this.timeEntryRepository.findOne({
        where: { id: entryId, userId },
      });

      if (!timeEntry) {
        throw new ProductivityException('Time entry not found or does not belong to user');
      }

      // Update fields
      Object.assign(timeEntry, timeEntryDto);

      // Recalculate duration if start and end times are provided
      if (timeEntry.startTime && timeEntry.endTime) {
        timeEntry.duration = Math.floor((timeEntry.endTime.getTime() - timeEntry.startTime.getTime()) / 1000);
      }

      return await this.timeEntryRepository.save(timeEntry);
    } catch (error) {
      this.logger.error(`Error updating time entry ${entryId}: ${error.message}`);
      throw new ProductivityException(`Failed to update time entry: ${error.message}`);
    }
  }

  /**
   * Delete a time entry
   */
  async deleteTimeEntry(entryId: string, userId: string): Promise<void> {
    try {
      // Find the time entry
      const timeEntry = await this.timeEntryRepository.findOne({
        where: { id: entryId, userId },
      });

      if (!timeEntry) {
        throw new ProductivityException('Time entry not found or does not belong to user');
      }

      await this.timeEntryRepository.remove(timeEntry);
    } catch (error) {
      this.logger.error(`Error deleting time entry ${entryId}: ${error.message}`);
      throw new ProductivityException(`Failed to delete time entry: ${error.message}`);
    }
  }

  /**
   * Generate a time tracking report
   */
  async generateTimeReport(userId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const timeEntries = await this.getTimeEntriesForDateRange(userId, startDate, endDate);

      let totalDuration = 0;
      const taskDurations: { [taskId: string]: number } = {};

      timeEntries.forEach(entry => {
        if (entry.duration) {
          totalDuration += entry.duration;

          if (entry.taskId) {
            if (!taskDurations[entry.taskId]) {
              taskDurations[entry.taskId] = 0;
            }
            taskDurations[entry.taskId] += entry.duration;
          }
        }
      });

      return {
        startDate,
        endDate,
        totalDuration, // in seconds
        totalDurationHours: totalDuration / 3600, // in hours
        taskDurations,
        timeEntries: timeEntries.length,
      };
    } catch (error) {
      this.logger.error(`Error generating time report: ${error.message}`);
      throw new ProductivityException(`Failed to generate time report: ${error.message}`);
    }
  }
}