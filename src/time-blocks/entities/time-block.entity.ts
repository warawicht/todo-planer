import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Length, Matches, IsDate } from 'class-validator';
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('time_blocks')
export class TimeBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Length(1, 100)
  title: string;

  @Column({ type: 'text', nullable: true })
  @Length(0, 500)
  description: string;

  @Column({ type: 'timestamp' })
  @IsDate()
  startTime: Date;

  @Column({ type: 'timestamp' })
  @IsDate()
  endTime: Date;

  @Column({ nullable: true })
  recurrencePattern: string;

  @Column({ nullable: true })
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color code' })
  color: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Version tracking for sync functionality
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSynced: Date;

  @ManyToOne(() => User, user => user.timeBlocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Task, task => task.timeBlocks, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ nullable: true })
  taskId: string;

  @BeforeInsert()
  @BeforeUpdate()
  validateTime() {
    if (this.startTime && this.endTime && this.startTime >= this.endTime) {
      throw new Error('End time must be after start time');
    }
  }
}