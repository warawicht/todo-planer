import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { TagsModule } from './tags/tags.module';
import { TimeBlocksModule } from './time-blocks/time-blocks.module';
import { User } from './users/user.entity';
import { RefreshToken } from './auth/refresh-token.entity';
import { Task } from './tasks/entities/task.entity';
import { TaskAttachment } from './tasks/entities/attachments/task-attachment.entity';
import { Project } from './projects/entities/project.entity';
import { Tag } from './tags/entities/tag.entity';
import { TimeBlock } from './time-blocks/entities/time-block.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'todo_planer',
      entities: [User, RefreshToken, Task, TaskAttachment, Project, Tag, TimeBlock],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    UsersModule,
    HealthModule,
    TasksModule,
    ProjectsModule,
    TagsModule,
    TimeBlocksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}