import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkflowInstance } from './workflow-instance.entity';

export class WorkflowStep {
  name: string;
  order: number;
  approvers: string[]; // Role IDs or User IDs
  requiredApprovals: number;
}

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  steps: WorkflowStep[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => WorkflowInstance, workflowInstance => workflowInstance.workflow)
  workflowInstances: WorkflowInstance[];
}