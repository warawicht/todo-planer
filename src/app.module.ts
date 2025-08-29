import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { TagsModule } from './tags/tags.module';
import { TimeBlocksModule } from './time-blocks/time-blocks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { AISchedulingModule } from './ai-scheduling/ai-scheduling.module';
import { OfflineModule } from './offline/offline.module';
import { User } from './users/user.entity';
import { RefreshToken } from './auth/refresh-token.entity';
import { Task } from './tasks/entities/task.entity';
import { TaskAttachment } from './tasks/entities/attachments/task-attachment.entity';
import { Project } from './projects/entities/project.entity';
import { Tag } from './tags/entities/tag.entity';
import { TimeBlock } from './time-blocks/entities/time-block.entity';
import { CalendarViewPreference } from './users/entities/calendar-view-preference.entity';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationPreference } from './notifications/entities/notification-preference.entity';
import { Reminder } from './notifications/entities/reminder.entity';
// Productivity Tracking Entities
import { ProductivityStatistic } from './productivity-tracking/entities/productivity-statistic.entity';
import { TimeEntry } from './productivity-tracking/entities/time-entry.entity';
import { TrendData } from './productivity-tracking/entities/trend-data.entity';
import { DashboardWidget } from './productivity-tracking/entities/dashboard-widget.entity';
// Settings Entities
import { ThemePreference } from './settings/entities/theme-preference.entity';
import { TimezonePreference } from './settings/entities/timezone-preference.entity';
import { ProfilePreference } from './settings/entities/profile-preference.entity';
import { DataExport } from './settings/entities/data-export.entity';
// AI Scheduling Entities
import { AISuggestion } from './ai-scheduling/entities/ai-suggestion.entity';
import { ProductivityPattern } from './ai-scheduling/entities/productivity-pattern.entity';
import { TaskPriorityRecommendation } from './ai-scheduling/entities/task-priority-recommendation.entity';
import { NLPProcessedTask } from './ai-scheduling/entities/nlp-processed-task.entity';
// Enterprise Feature Entities
import { Role } from './enterprise/entities/role.entity';
import { Permission } from './enterprise/entities/permission.entity';
import { UserRole } from './enterprise/entities/user-role.entity';
import { RolePermission } from './enterprise/entities/role-permission.entity';
import { ActivityLog } from './enterprise/entities/activity-log.entity';
import { Workflow } from './enterprise/entities/workflow.entity';
import { WorkflowInstance } from './enterprise/entities/workflow-instance.entity';
import { AuditTrail } from './enterprise/entities/audit-trail.entity';
// Enterprise Module
import { EnterpriseModule } from './enterprise/enterprise.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'todo_planer',
      entities: [
        User, 
        RefreshToken, 
        Task, 
        TaskAttachment, 
        Project, 
        Tag, 
        TimeBlock, 
        CalendarViewPreference, 
        Notification, 
        NotificationPreference, 
        Reminder,
        // Productivity Tracking Entities
        ProductivityStatistic,
        TimeEntry,
        TrendData,
        DashboardWidget,
        // Settings Entities
        ThemePreference,
        TimezonePreference,
        ProfilePreference,
        DataExport,
        // AI Scheduling Entities
        AISuggestion,
        ProductivityPattern,
        TaskPriorityRecommendation,
        NLPProcessedTask,
        // Enterprise Feature Entities
        Role,
        Permission,
        UserRole,
        RolePermission,
        ActivityLog,
        Workflow,
        WorkflowInstance,
        AuditTrail
      ],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    UsersModule,
    HealthModule,
    TasksModule,
    ProjectsModule,
    TagsModule,
    TimeBlocksModule,
    NotificationsModule,
    SettingsModule,
    AISchedulingModule,
    OfflineModule,
    EnterpriseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}