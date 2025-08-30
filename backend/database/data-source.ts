import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

import { User } from '../users/user.entity';
import { RefreshToken } from '../auth/refresh-token.entity';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { Tag } from '../tags/entities/tag.entity';
import { TimeBlock } from '../time-blocks/entities/time-block.entity';
import { TaskAttachment } from '../tasks/entities/attachments/task-attachment.entity';
import { Reminder } from '../notifications/entities/reminder.entity';
import { CalendarViewPreference } from '../users/entities/calendar-view-preference.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationPreference } from '../notifications/entities/notification-preference.entity';
// Productivity Tracking Entities
import { ProductivityStatistic } from '../productivity-tracking/entities/productivity-statistic.entity';
import { TimeEntry } from '../productivity-tracking/entities/time-entry.entity';
import { TrendData } from '../productivity-tracking/entities/trend-data.entity';
import { DashboardWidget } from '../productivity-tracking/entities/dashboard-widget.entity';
import { Goal } from '../productivity-tracking/entities/goal.entity';
import { Insight } from '../productivity-tracking/entities/insight.entity';
import { ReportTemplate } from '../productivity-tracking/entities/report-template.entity';
import { AnalyticsExport } from '../productivity-tracking/entities/analytics-export.entity';
// Settings Entities
import { ThemePreference } from '../settings/entities/theme-preference.entity';
import { TimezonePreference } from '../settings/entities/timezone-preference.entity';
import { ProfilePreference } from '../settings/entities/profile-preference.entity';
import { DataExport } from '../settings/entities/data-export.entity';
// Collaboration Entities
import { TaskShare } from '../collaboration/task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../collaboration/task-assignment/entities/task-assignment.entity';
import { TaskComment } from '../collaboration/comments/entities/task-comment.entity';
import { UserAvailability } from '../collaboration/availability/entities/user-availability.entity';
// Enterprise Feature Entities
import { Role } from '../enterprise/entities/role.entity';
import { Permission } from '../enterprise/entities/permission.entity';
import { UserRole } from '../enterprise/entities/user-role.entity';
import { RolePermission } from '../enterprise/entities/role-permission.entity';
import { ActivityLog } from '../enterprise/entities/activity-log.entity';
import { Workflow } from '../enterprise/entities/workflow.entity';
import { WorkflowInstance } from '../enterprise/entities/workflow-instance.entity';
import { AuditTrail } from '../enterprise/entities/audit-trail.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || process.env.DB_USERNAME || 'todo_planner_user',
  password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || 'todo_planner_password',
  database: process.env.DATABASE_NAME || process.env.DB_NAME || 'todo_planner_dev',
  synchronize: false,
  logging: false,
  entities: [
    User, 
    RefreshToken, 
    Task, 
    Project, 
    Tag, 
    TimeBlock,
    TaskAttachment,
    Reminder,
    CalendarViewPreference,
    Notification,
    NotificationPreference,
    // Productivity Tracking Entities
    ProductivityStatistic,
    TimeEntry,
    TrendData,
    DashboardWidget,
    Goal,
    Insight,
    ReportTemplate,
    AnalyticsExport,
    // Settings Entities
    ThemePreference,
    TimezonePreference,
    ProfilePreference,
    DataExport,
    // Collaboration Entities
    TaskShare,
    TaskAssignment,
    TaskComment,
    UserAvailability,
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
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  subscribers: [],
});