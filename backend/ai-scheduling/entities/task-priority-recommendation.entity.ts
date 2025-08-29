import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('task_priority_recommendations')
export class TaskPriorityRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, task => task.id)
  task: Task;

  @Column({ type: 'int' })
  recommendedPriority: number;

  @Column({ type: 'float' })
  confidenceScore: number;

  @Column({ type: 'json' })
  factors: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}