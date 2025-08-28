import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ 
    type: 'enum', 
    enum: ['task_reminder', 'time_block_alert', 'deadline_warning', 'productivity_summary', 'system_alert'] 
  })
  type: 'task_reminder' | 'time_block_alert' | 'deadline_warning' | 'productivity_summary' | 'system_alert';

  @Column({ 
    type: 'enum', 
    enum: ['email', 'push', 'in_app'] 
  })
  channel: 'email' | 'push' | 'in_app';

  @Column({ type: 'int', default: 2 })
  priority: number; // 0-4 (0=none, 1=low, 2=medium, 3=high, 4=urgent)

  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  dismissed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string; // ID of related task, time block, etc.

  @Column({ 
    type: 'enum', 
    enum: ['task', 'time_block', 'project'],
    nullable: true
  })
  relatedEntityType: 'task' | 'time_block' | 'project';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}