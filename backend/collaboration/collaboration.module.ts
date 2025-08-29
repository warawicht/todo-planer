import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskSharingModule } from './task-sharing/task-sharing.module';
import { TaskAssignmentModule } from './task-assignment/task-assignment.module';
import { CommentsModule } from './comments/comments.module';
import { AvailabilityModule } from './availability/availability.module';
import { TeamCalendarModule } from './team-calendar/team-calendar.module';
import { CollaborationNotificationService } from './services/collaboration-notification.service';
import { CollaborationTemplateService } from './services/collaboration-template.service';
import { CollaborationPermissionService } from './services/collaboration-permission.service';
import { InputSanitizationService } from './services/input-sanitization.service';
import { CollaborationCacheService } from './services/collaboration-cache.service';
import { PermissionConflictService } from './services/permission-conflict.service';
import { StorageLimitationService } from './services/storage-limitation.service';
import { RateLimitingService } from './services/rate-limiting.service';
import { EncryptionService } from './services/encryption.service';
import { NotificationService } from '../notifications/services/notification.service';
import { Notification } from '../notifications/entities/notification.entity';
import { Task } from '../tasks/entities/task.entity';
import { TasksModule } from '../tasks/tasks.module';
import { CollaborationAccessGuard } from './guards/collaboration-access.guard';
import { CollaborationAuditService } from './services/collaboration-audit.service';
import { CollaborationDataDeletionService } from './services/collaboration-data-deletion.service';
import { TaskShare } from './task-sharing/entities/task-share.entity';
import { TaskAssignment } from './task-assignment/entities/task-assignment.entity';
import { TaskComment } from './comments/entities/task-comment.entity';
import { UserAvailability } from './availability/entities/user-availability.entity';
import { User } from '../users/user.entity';
import { CollaborationHealthIndicator } from './services/collaboration-health.service';
import { CollaborationMonitoringService } from './services/collaboration-monitoring.service';
import { CollaborationBackupService } from './services/collaboration-backup.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    CacheModule.register(),
    TaskSharingModule,
    TaskAssignmentModule,
    CommentsModule,
    AvailabilityModule,
    TeamCalendarModule,
    TasksModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      Notification, 
      Task, 
      TaskShare, 
      TaskAssignment, 
      TaskComment, 
      UserAvailability,
      User,
    ]),
  ],
  providers: [
    CollaborationNotificationService,
    CollaborationTemplateService,
    CollaborationPermissionService,
    InputSanitizationService,
    CollaborationCacheService,
    PermissionConflictService,
    StorageLimitationService,
    RateLimitingService,
    EncryptionService,
    NotificationService,
    CollaborationAccessGuard,
    CollaborationAuditService,
    CollaborationDataDeletionService,
    CollaborationHealthIndicator,
    CollaborationMonitoringService,
    CollaborationBackupService,
  ],
  exports: [
    CacheModule,
    TaskSharingModule,
    TaskAssignmentModule,
    CommentsModule,
    AvailabilityModule,
    TeamCalendarModule,
    CollaborationNotificationService,
    CollaborationTemplateService,
    CollaborationPermissionService,
    InputSanitizationService,
    CollaborationCacheService,
    PermissionConflictService,
    StorageLimitationService,
    RateLimitingService,
    EncryptionService,
    CollaborationAccessGuard,
    CollaborationAuditService,
    CollaborationDataDeletionService,
    CollaborationHealthIndicator,
    CollaborationMonitoringService,
    CollaborationBackupService,
  ],
})
export class CollaborationModule {}