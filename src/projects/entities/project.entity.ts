import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Length, Matches } from 'class-validator';
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Length(1, 100)
  name: string;

  @Column({ type: 'text', nullable: true })
  @Length(0, 1000)
  description: string;

  @Column({ nullable: true })
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color code' })
  color: string;

  @Column({ default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Task, task => task.project, { cascade: true })
  tasks: Task[];

  @BeforeInsert()
  @BeforeUpdate()
  beforeSave() {
    if (this.name) {
      this.name = this.name.trim();
    }
  }
}