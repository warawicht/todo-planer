import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import { TaskComment } from './entities/task-comment.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskComment, Task, User]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentsModule {}