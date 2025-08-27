import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskAttachmentsService } from './services/task-attachments.service';
import { Task } from './entities/task.entity';
import { TaskAttachment } from './entities/attachments/task-attachment.entity';
import { ProjectsModule } from '../projects/projects.module';
import { TagsModule } from '../tags/tags.module';
import { TimeBlocksModule } from '../time-blocks/time-blocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskAttachment]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => TagsModule),
    forwardRef(() => TimeBlocksModule),
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskAttachmentsService],
  exports: [TasksService, TaskAttachmentsService],
})
export class TasksModule {}