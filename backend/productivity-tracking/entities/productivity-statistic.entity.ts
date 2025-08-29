import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsInt, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { User } from '../../users/user.entity';

@Entity('productivity_statistics')
export class ProductivityStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column({ type: 'date' })
  @IsDateString()
  date: Date;

  @Column({ type: 'int' })
  @IsInt()
  tasksCompleted: number;

  @Column({ type: 'int' })
  @IsInt()
  tasksCreated: number;

  @Column({ type: 'int' })
  @IsInt()
  overdueTasks: number;

  @Column({ type: 'float' })
  @IsNumber()
  completionRate: number;

  @Column({ type: 'bigint' })
  @IsInt()
  totalTimeTracked: number; // in seconds

  @Column({ type: 'float', nullable: true })
  @IsNumber()
  averageCompletionTime: number; // in hours

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.productivityStatistics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}