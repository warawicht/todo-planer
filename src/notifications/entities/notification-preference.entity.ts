import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: true })
  emailEnabled: boolean;

  @Column({ default: true })
  pushEnabled: boolean;

  @Column({ default: true })
  inAppEnabled: boolean;

  @Column({ type: 'time', nullable: true })
  quietHoursStart: string; // HH:MM format

  @Column({ type: 'time', nullable: true })
  quietHoursEnd: string; // HH:MM format

  @Column({ default: false })
  quietHoursEnabled: boolean;

  @Column({ default: true })
  taskRemindersEnabled: boolean;

  @Column({ default: true })
  timeBlockAlertsEnabled: boolean;

  @Column({ default: true })
  deadlineWarningsEnabled: boolean;

  @Column({ default: true })
  productivitySummariesEnabled: boolean;

  @Column({ default: true })
  systemAlertsEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}