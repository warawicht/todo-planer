import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskAssignmentController } from './controllers/task-assignment.controller';
import { TaskAssignmentService } from './services/task-assignment.service';
import { TaskAssignment } from './entities/task-assignment.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskAssignment, Task, User]),
  ],
  controllers: [TaskAssignmentController],
  providers: [TaskAssignmentService],
  exports: [TaskAssignmentService],
})
export class TaskAssignmentModule {}