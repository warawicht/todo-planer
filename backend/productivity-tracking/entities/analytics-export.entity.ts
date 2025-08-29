import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { User } from '../../users/user.entity';

export type ExportFormat = 'pdf' | 'csv' | 'excel';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

@Entity('analytics_exports')
export class AnalyticsExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['pdf', 'csv', 'excel'],
    enumName: 'export_format_enum'
  })
  @IsString()
  format: ExportFormat;

  @Column()
  @IsString()
  dataType: string;

  @Column()
  @IsString()
  fileName: string;

  @Column({ type: 'timestamp' })
  @IsDateString()
  exportDate: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    enumName: 'export_status_enum',
    default: 'pending'
  })
  @IsString()
  status: ExportStatus;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  filters: any;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDateString()
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDateString()
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDateString()
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  errorMessage: string;

  @CreateDateColumn()
  @IsDateString()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDateString()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.analyticsExports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}