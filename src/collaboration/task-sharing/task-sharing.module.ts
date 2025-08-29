import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskSharingController } from './controllers/task-sharing.controller';
import { TaskSharingService } from './services/task-sharing.service';
import { TaskShare } from './entities/task-share.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';
import { TaskAssignment } from '../task-assignment/entities/task-assignment.entity';
import { InputSanitizationService } from '../services/input-sanitization.service';
import { CollaborationCacheService } from '../services/collaboration-cache.service';
import { PermissionConflictService } from '../services/permission-conflict.service';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([TaskShare, Task, User, TaskAssignment]),
  ],
  controllers: [TaskSharingController],
  providers: [
    TaskSharingService,
    InputSanitizationService,
    CollaborationCacheService,
    PermissionConflictService,
  ],
  exports: [TaskSharingService],
})
export class TaskSharingModule {}