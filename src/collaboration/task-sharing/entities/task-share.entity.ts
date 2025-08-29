import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/user.entity';

@Entity('task_shares')
export class TaskShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, task => task.shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, user => user.taskShares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'uuid' })
  sharedWithId: string;

  @ManyToOne(() => User, user => user.sharedTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sharedWithId' })
  sharedWith: User;

  @Column({ 
    type: 'enum', 
    enum: ['view', 'edit', 'manage'],
    default: 'view'
  })
  permissionLevel: 'view' | 'edit' | 'manage';

  @Column({ default: false })
  isAccepted: boolean;

  @Column({ nullable: true })
  acceptedAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}