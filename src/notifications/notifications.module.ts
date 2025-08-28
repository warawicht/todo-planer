import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './controllers/notifications.controller';
import { RemindersController } from './controllers/reminders.controller';
import { NotificationPreferencesController } from './controllers/notification-preferences.controller';
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { PushService } from './services/push.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { EmailTemplateService } from './services/email-template.service';
import { QuietHoursService } from './services/quiet-hours.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { Notification } from './entities/notification.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/user.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { Reminder } from './entities/reminder.entity';
import { TasksModule } from '../tasks/tasks.module';
import { TimeBlocksModule } from '../time-blocks/time-blocks.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference, Reminder, Task, User]),
    TasksModule,
    TimeBlocksModule,
    UsersModule,
  ],
  controllers: [
    NotificationsController,
    RemindersController,
    NotificationPreferencesController,
  ],
  providers: [
    NotificationService,
    EmailService,
    PushService,
    NotificationSchedulerService,
    EmailTemplateService,
    QuietHoursService,
    NotificationPreferenceService,
    UsersService,
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}