import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { RefreshToken } from '../auth/refresh-token.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'todo_planer',
  synchronize: false,
  logging: false,
  entities: [User, RefreshToken],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  subscribers: [],
});