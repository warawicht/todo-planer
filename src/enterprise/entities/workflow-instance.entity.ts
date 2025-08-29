import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workflow } from './workflow.entity';

export class ApprovalRecord {
  userId: string;
  action: 'approved' | 'rejected';
  timestamp: Date;
  comments: string;
}

@Entity('workflow_instances')
export class WorkflowInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowId: string;

  @Column()
  resourceId: string; // ID of the resource being processed

  @Column()
  resourceType: string; // Type of resource (task, project, etc.)

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: "'pending'"
  })
  status: 'pending' | 'approved' | 'rejected' | 'completed';

  @Column({ type: 'jsonb' })
  currentStep: any; // Using any instead of WorkflowStep to avoid circular dependency issues

  @Column({ type: 'jsonb' })
  approvalHistory: ApprovalRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Workflow, workflow => workflow.workflowInstances)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;
}