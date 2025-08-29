import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskSharingController } from './controllers/task-sharing.controller';
import { TaskSharingService } from './services/task-sharing.service';
import { TaskShare } from './entities/task-share.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskShare, Task, User]),
  ],
  controllers: [TaskSharingController],
  providers: [TaskSharingService],
  exports: [TaskSharingService],
})
export class TaskSharingModule {}