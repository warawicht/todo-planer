import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsUUID, IsOptional, IsDateString, IsInt, IsEnum } from 'class-validator';
import { User } from '../../users/user.entity';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly';
export type GoalMetric = 'tasks_completed' | 'time_tracked' | 'projects_completed';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column()
  @IsString()
  title: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  @IsOptional()
  description: string;

  @Column({ type: 'decimal' })
  @IsInt()
  targetValue: number;

  @Column({ type: 'decimal', default: 0 })
  @IsInt()
  currentValue: number;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly'],
    enumName: 'goal_period_enum'
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  period: GoalPeriod;

  @Column({
    type: 'enum',
    enum: ['tasks_completed', 'time_tracked', 'projects_completed'],
    enumName: 'goal_metric_enum'
  })
  @IsEnum(['tasks_completed', 'time_tracked', 'projects_completed'])
  metric: GoalMetric;

  @Column({ type: 'timestamp' })
  @IsDateString()
  startDate: Date;

  @Column({ type: 'timestamp' })
  @IsDateString()
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsDateString()
  @IsOptional()
  completedAt: Date;

  @CreateDateColumn()
  @IsDateString()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDateString()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}