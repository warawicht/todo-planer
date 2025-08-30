import { Module } from '@nestjs/common';
import { DemoDataService } from './demo-data.service';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { TagsModule } from '../tags/tags.module';
import { TimeBlocksModule } from '../time-blocks/time-blocks.module';

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    TasksModule,
    TagsModule,
    TimeBlocksModule,
  ],
  providers: [DemoDataService],
  exports: [DemoDataService],
})
export class DemoDataModule {}