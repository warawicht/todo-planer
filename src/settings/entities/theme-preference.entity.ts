import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('theme_preferences')
export class ThemePreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ['light', 'dark', 'system'], default: 'system' })
  theme: 'light' | 'dark' | 'system';

  @Column({ default: '#4a76d4' })
  accentColor: string;

  @Column({ default: false })
  highContrastMode: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}