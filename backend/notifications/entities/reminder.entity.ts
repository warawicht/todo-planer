import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, task => task.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ 
    type: 'enum', 
    enum: ['at_time', '5_min', '1_hour', '1_day'] 
  })
  timeBefore: 'at_time' | '5_min' | '1_hour' | '1_day'; // When to send reminder

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSentAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}