import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsInt, IsUUID } from 'class-validator';
import { User } from '../../users/user.entity';

@Entity('dashboard_widgets')
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column()
  widgetType: string;

  @Column({ type: 'int' })
  @IsInt()
  position: number;

  @Column({ type: 'jsonb' })
  config: any; // JSON configuration for the widget

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.dashboardWidgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}