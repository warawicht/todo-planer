import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { IsIn, Length, Min, Max } from 'class-validator';
import { User } from '../../users/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { TimeBlock } from '../../time-blocks/entities/time-block.entity';
import { TaskAttachment } from './attachments/task-attachment.entity';
import { Reminder } from '../../notifications/entities/reminder.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Length(1, 255)
  title: string;

  @Column({ type: 'text', nullable: true })
  @Length(0, 5000)
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'int', default: 0 })
  @Min(0)
  @Max(4)
  priority: number;

  @Column({ default: 'pending' })
  @IsIn(['pending', 'in-progress', 'completed', 'cancelled'])
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Subtask relationships
  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Task, task => task.subtasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Task;

  @OneToMany(() => Task, task => task.parent)
  subtasks: Task[];

  @Column({ type: 'int', nullable: true })
  position: number;

  @ManyToOne(() => User, user => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Project, project => project.tasks, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  projectId: string;

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'taskId' },
    inverseJoinColumn: { name: 'tagId' }
  })
  tags: Tag[];

  @OneToMany(() => TimeBlock, timeBlock => timeBlock.task, { cascade: true })
  timeBlocks: TimeBlock[];

  @OneToMany(() => TaskAttachment, attachment => attachment.task, { cascade: true })
  attachments: TaskAttachment[];
  
  @OneToMany(() => Reminder, reminder => reminder.task, { cascade: true })
  reminders: Reminder[];
}