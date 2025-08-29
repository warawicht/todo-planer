import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { RefreshToken } from '../auth/refresh-token.entity';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { Tag } from '../tags/entities/tag.entity';
import { TimeBlock } from '../time-blocks/entities/time-block.entity';
import { TaskAttachment } from '../tasks/entities/attachments/task-attachment.entity';
import { CalendarViewPreference } from './entities/calendar-view-preference.entity';
import { Notification } from '../notifications/entities/notification.entity';
// Productivity Tracking Entities
import { ProductivityStatistic } from '../productivity-tracking/entities/productivity-statistic.entity';
import { TimeEntry } from '../productivity-tracking/entities/time-entry.entity';
import { TrendData } from '../productivity-tracking/entities/trend-data.entity';
import { DashboardWidget } from '../productivity-tracking/entities/dashboard-widget.entity';
import { TaskShare } from '../collaboration/task-sharing/entities/task-share.entity';
import { TaskAssignment } from '../collaboration/task-assignment/entities/task-assignment.entity';
import { TaskComment } from '../collaboration/comments/entities/task-comment.entity';
import { UserAvailability } from '../collaboration/availability/entities/user-availability.entity';
// Enterprise Feature Entities
import { UserRole } from '../enterprise/entities/user-role.entity';
import { ActivityLog } from '../enterprise/entities/activity-log.entity';
import { AuditTrail } from '../enterprise/entities/audit-trail.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  emailVerificationTokenExpires: Date;

  @Column({ nullable: true })
  @Exclude()
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetTokenExpires: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockoutUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: RefreshToken[];
  
  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
  
  @OneToMany(() => Project, project => project.user)
  projects: Project[];
  
  @OneToMany(() => Tag, tag => tag.user)
  tags: Tag[];
  
  @OneToMany(() => TimeBlock, timeBlock => timeBlock.user)
  timeBlocks: TimeBlock[];
  
  @OneToMany(() => TaskAttachment, taskAttachment => taskAttachment.user)
  taskAttachments: TaskAttachment[];
  
  @OneToOne(() => CalendarViewPreference, calendarViewPreference => calendarViewPreference.user)
  calendarViewPreference: CalendarViewPreference;
  
  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
  
  // Productivity Tracking Relationships
  @OneToMany(() => ProductivityStatistic, statistic => statistic.user)
  productivityStatistics: ProductivityStatistic[];
  
  @OneToMany(() => TimeEntry, timeEntry => timeEntry.user)
  timeEntries: TimeEntry[];
  
  @OneToMany(() => TrendData, trendData => trendData.user)
  trendData: TrendData[];
  
  @OneToMany(() => DashboardWidget, dashboardWidget => dashboardWidget.user)
  dashboardWidgets: DashboardWidget[];

  @OneToMany(() => TaskShare, share => share.owner)
  sharedTasks: TaskShare[];

  @OneToMany(() => TaskShare, share => share.sharedWith)
  receivedSharedTasks: TaskShare[];

  @OneToMany(() => TaskAssignment, assignment => assignment.assignedBy)
  assignedTasks: TaskAssignment[];

  @OneToMany(() => TaskAssignment, assignment => assignment.assignedTo)
  receivedAssignedTasks: TaskAssignment[];

  @OneToMany(() => TaskComment, comment => comment.user)
  taskComments: TaskComment[];

  @OneToMany(() => UserAvailability, availability => availability.user)
  availability: UserAvailability[];

  // Enterprise Feature Relationships
  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => ActivityLog, activityLog => activityLog.user)
  activityLogs: ActivityLog[];

  @OneToMany(() => AuditTrail, auditTrail => auditTrail.user)
  auditTrails: AuditTrail[];
}