import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('nlp_processed_tasks')
export class NLPProcessedTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column({ type: 'text' })
  originalText: string;

  @Column()
  extractedTitle: string;

  @Column({ type: 'text', nullable: true })
  extractedDescription: string;

  @Column({ type: 'timestamp', nullable: true })
  extractedDueDate: Date;

  @Column({ type: 'int', nullable: true })
  extractedPriority: number;

  @Column({ type: 'uuid', nullable: true })
  extractedProjectId: string;

  @ManyToOne(() => Project, project => project.id)
  project: Project;

  @Column({ type: 'json' })
  confidenceScores: Record<string, number>;

  @Column({ type: 'boolean', default: false })
  isReviewed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}