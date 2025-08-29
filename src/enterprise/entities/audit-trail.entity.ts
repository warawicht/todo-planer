import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('audit_trails')
export class AuditTrail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  action: string;

  @Column()
  resourceType: string;

  @Column()
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  beforeState: any;

  @Column({ type: 'jsonb', nullable: true })
  afterState: any;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, user => user.auditTrails)
  @JoinColumn({ name: 'userId' })
  user: User;
}