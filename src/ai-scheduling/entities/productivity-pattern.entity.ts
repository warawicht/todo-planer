import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

export enum ProductivityPatternType {
  TIME_BASED = 'time_based',
  TASK_BASED = 'task_based',
  PROJECT_BASED = 'project_based',
  DAY_OF_WEEK = 'day_of_week',
}

@Entity('productivity_patterns')
export class ProductivityPattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column({
    type: 'enum',
    enum: ProductivityPatternType,
  })
  type: ProductivityPatternType;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  frequency: number;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'json' })
  daysOfWeek: string[];

  @Column({ type: 'float' })
  productivityScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}