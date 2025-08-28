import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsBoolean, IsInt, IsDateString, IsUUID, IsOptional } from 'class-validator';
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column({ nullable: true })
  @IsUUID()
  @IsOptional()
  taskId: string;

  @Column({ type: 'timestamp' })
  @IsDateString()
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsDateString()
  @IsOptional()
  endTime: Date;

  @Column({ type: 'bigint', nullable: true })
  @IsInt()
  @IsOptional()
  duration: number; // in seconds

  @Column({ default: false })
  @IsBoolean()
  isManual: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.timeEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Task, task => task.timeEntries, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'taskId' })
  task: Task;
}