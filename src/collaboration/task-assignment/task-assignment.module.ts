import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskAssignmentController } from './controllers/task-assignment.controller';
import { TaskAssignmentService } from './services/task-assignment.service';
import { TaskAssignment } from './entities/task-assignment.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';
import { InputSanitizationService } from '../services/input-sanitization.service';
import { CollaborationCacheService } from '../services/collaboration-cache.service';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([TaskAssignment, Task, User]),
  ],
  controllers: [TaskAssignmentController],
  providers: [
    TaskAssignmentService,
    InputSanitizationService,
    CollaborationCacheService,
  ],
  exports: [TaskAssignmentService],
})
export class TaskAssignmentModule {}