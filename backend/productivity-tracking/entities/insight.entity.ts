import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsUUID, IsOptional, IsDateString, IsBoolean, IsInt } from 'class-validator';
import { User } from '../../users/user.entity';

export type InsightType = 'improving_trend' | 'declining_trend' | 'pattern_identified' | 'recommendation';

@Entity('insights')
export class Insight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['improving_trend', 'declining_trend', 'pattern_identified', 'recommendation'],
    enumName: 'insight_type_enum'
  })
  @IsString()
  type: InsightType;

  @Column({ type: 'text' })
  @IsString()
  message: string;

  @Column({ type: 'int', default: 1 })
  @IsInt()
  severity: number; // 1-5 scale

  @Column({ default: false })
  @IsBoolean()
  isActionable: boolean;

  @Column({ type: 'text', nullable: true })
  @IsString()
  @IsOptional()
  recommendation: string;

  @Column({ default: false })
  @IsBoolean()
  isDismissed: boolean;

  @CreateDateColumn()
  @IsDateString()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDateString()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.insights, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}