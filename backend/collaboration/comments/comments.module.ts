import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import { TaskComment } from './entities/task-comment.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';
import { InputSanitizationService } from '../services/input-sanitization.service';
import { CollaborationCacheService } from '../services/collaboration-cache.service';
import { StorageLimitationService } from '../services/storage-limitation.service';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([TaskComment, Task, User]),
  ],
  controllers: [CommentController],
  providers: [
    CommentService,
    InputSanitizationService,
    CollaborationCacheService,
    StorageLimitationService,
  ],
  exports: [CommentService],
})
export class CommentsModule {}