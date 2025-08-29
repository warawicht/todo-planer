import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/user.entity';

@Entity('task_assignments')
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, task => task.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ type: 'uuid' })
  assignedById: string;

  @ManyToOne(() => User, user => user.assignedTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;

  @Column({ type: 'uuid' })
  assignedToId: string;

  @ManyToOne(() => User, user => user.assignedTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  })
  status: 'pending' | 'accepted' | 'rejected' | 'completed';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}