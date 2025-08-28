import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsDateString, IsUUID, IsIn } from 'class-validator';
import { User } from '../../users/user.entity';

@Entity('trend_data')
export class TrendData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column({ type: 'date' })
  @IsDateString()
  startDate: Date;

  @Column({ type: 'date' })
  @IsDateString()
  endDate: Date;

  @Column({ type: 'varchar' })
  @IsIn(['daily', 'weekly', 'monthly'])
  period: 'daily' | 'weekly' | 'monthly';

  @Column({ type: 'jsonb' })
  data: any; // JSON data containing trend metrics

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.trendData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}