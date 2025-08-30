import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure CORS to allow frontend requests
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });
  
  app.use(cookieParser());
  
  // Serve static files from the frontend build
  app.useStaticAssets(join(__dirname, '..', 'frontend', 'dist'), {
    prefix: '/',
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();