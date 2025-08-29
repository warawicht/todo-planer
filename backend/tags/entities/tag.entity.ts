import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Length, Matches } from 'class-validator';
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Length(1, 50)
  name: string;

  @Column({ nullable: true })
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color code' })
  color: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToMany(() => Task, task => task.tags)
  tasks: Task[];

  @BeforeInsert()
  @BeforeUpdate()
  beforeSave() {
    if (this.name) {
      this.name = this.name.trim().toLowerCase();
    }
  }
}