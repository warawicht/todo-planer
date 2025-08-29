import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity('calendar_view_preferences')
export class CalendarViewPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, user => user.calendarViewPreference)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ['day', 'week', 'month'], default: 'week' })
  defaultView: 'day' | 'week' | 'month';

  @Column({ type: 'int', default: 0 })
  firstDayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.

  @Column({ type: 'boolean', default: true })
  showWeekends: boolean;

  @Column({ type: 'enum', enum: ['12h', '24h'], default: '12h' })
  timeFormat: '12h' | '24h';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}