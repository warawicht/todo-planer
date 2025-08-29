import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('data_exports')
export class DataExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ['json', 'csv', 'pdf'], default: 'json' })
  format: 'json' | 'csv' | 'pdf';

  @Column({ type: 'enum', enum: ['all', 'tasks', 'projects', 'time-blocks'], default: 'all' })
  dataType: 'all' | 'tasks' | 'projects' | 'time-blocks';

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'timestamp', nullable: true })
  exportedAt: Date;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}