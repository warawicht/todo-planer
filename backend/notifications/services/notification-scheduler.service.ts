import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { PushService } from './push.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { QuietHoursService } from './quiet-hours.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reminder } from '../entities/reminder.entity';
import { Notification } from '../entities/notification.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    private readonly pushService: PushService,
    private readonly notificationPreferenceService: NotificationPreferenceService,
    private readonly quietHoursService: QuietHoursService,
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleUpcomingReminders() {
    this.logger.debug('Checking for upcoming reminders');
    try {
      // Get all active reminders
      const reminders = await this.reminderRepository.find({ 
        where: { enabled: true },
        relations: ['task'] 
      });
      
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
      
      // Process each reminder
      for (const reminder of reminders) {
        const triggerTime = this.calculateTriggerTime(reminder);
        
        // Check if this reminder should trigger in the next 5 minutes
        if (triggerTime >= now && triggerTime <= fiveMinutesFromNow) {
          await this.processReminder(reminder, triggerTime);
        }
      }
      
      this.logger.debug('Reminder processing completed');
    } catch (error) {
      this.logger.error('Failed to process upcoming reminders', error.stack);
    }
  }

  private calculateTriggerTime(reminder: Reminder): Date {
    const taskTime = reminder.task.dueDate || new Date();
    
    switch (reminder.timeBefore) {
      case '5_min':
        return new Date(taskTime.getTime() - 5 * 60000);
      case '1_hour':
        return new Date(taskTime.getTime() - 60 * 60000);
      case '1_day':
        return new Date(taskTime.getTime() - 24 * 60 * 60000);
      case 'at_time':
      default:
        return taskTime;
    }
  }

  private async processReminder(reminder: Reminder, triggerTime: Date) {
    try {
      // Get user's notification preferences
      const preferences = await this.notificationPreferenceService.findOne(reminder.task.userId);
      
      // Get user to potentially get timezone (in a real implementation, User would have a timezone field)
      const user = await this.userRepository.findOne({ where: { id: reminder.task.userId } });
      // For now, we'll pass undefined for timezone since it's not in the User entity
      const userTimezone = undefined; // user?.timezone;
      
      // Check if we should suppress notifications due to quiet hours
      if (this.quietHoursService.shouldSuppressNotification(preferences, 2, userTimezone)) {
        this.logger.debug(`Skipping reminder ${reminder.id} due to quiet hours`);
        return;
      }
      
      // Create notification record
      const notification = new Notification();
      notification.userId = reminder.task.userId;
      notification.title = `Reminder: ${reminder.task.title}`;
      notification.message = `Task "${reminder.task.title}" is due soon`;
      notification.type = 'task_reminder';
      notification.priority = 2;
      notification.relatedEntityId = reminder.task.id;
      notification.relatedEntityType = 'task';
      
      // Save notification
      // In a real implementation, this would be done through NotificationService
      // For now, we'll log that we would send notifications
      
      this.logger.debug(`Processing reminder for task ${reminder.task.id}`);
      
      // Send notifications based on user preferences
      if (preferences.emailEnabled && preferences.taskRemindersEnabled) {
        await this.emailService.sendTaskReminder(reminder.task, reminder.timeBefore);
      }
      
      if (preferences.pushEnabled && preferences.taskRemindersEnabled) {
        await this.pushService.sendTaskReminder(reminder.task, reminder.timeBefore);
      }
      
      // Update last sent timestamp
      reminder.lastSentAt = new Date();
      await this.reminderRepository.save(reminder);
    } catch (error) {
      this.logger.error(`Failed to process reminder ${reminder.id}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleDailySummaries() {
    this.logger.debug('Generating daily productivity summaries');
    try {
      // In a real implementation, this would generate daily summaries
      // based on user activity and preferences
      this.logger.debug('Daily summary generation completed');
    } catch (error) {
      this.logger.error('Failed to generate daily summaries', error.stack);
    }
  }
}