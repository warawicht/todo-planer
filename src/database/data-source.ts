import { DataSource } from 'typeorm';
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
// Settings Entities
import { ThemePreference } from '../settings/entities/theme-preference.entity';
import { TimezonePreference } from '../settings/entities/timezone-preference.entity';
import { ProfilePreference } from '../settings/entities/profile-preference.entity';
import { DataExport } from '../settings/entities/data-export.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'todo_planer',
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
    // Settings Entities
    ThemePreference,
    TimezonePreference,
    ProfilePreference,
    DataExport
  ],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  subscribers: [],
});