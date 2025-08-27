import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { ProjectsModule } from '../projects/projects.module';
import { TagsModule } from '../tags/tags.module';
import { TimeBlocksModule } from '../time-blocks/time-blocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => TagsModule),
    forwardRef(() => TimeBlocksModule),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}