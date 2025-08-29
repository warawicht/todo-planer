import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';

export enum AISuggestionType {
  SCHEDULING = 'scheduling',
  PRIORITIZATION = 'prioritization',
  PRODUCTIVITY = 'productivity',
}

@Entity('ai_suggestions')
export class AISuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column({
    type: 'enum',
    enum: AISuggestionType,
  })
  type: AISuggestionType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  suggestedStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  suggestedEndTime: Date;

  @Column({ type: 'uuid', nullable: true })
  taskId: string;

  @ManyToOne(() => Task, task => task.id)
  task: Task;

  @Column({ type: 'int' })
  priority: number;

  @Column({ type: 'boolean', default: true })
  isActionable: boolean;

  @Column({ type: 'text' })
  recommendation: string;

  @Column({ type: 'boolean', default: false })
  isDismissed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}