import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { RefreshToken } from '../auth/refresh-token.entity';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { Tag } from '../tags/entities/tag.entity';
import { TimeBlock } from '../time-blocks/entities/time-block.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'todo_planer',
  synchronize: false,
  logging: false,
  entities: [User, RefreshToken, Task, Project, Tag, TimeBlock],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  subscribers: [],
});