import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  
  // Serve static files from the frontend build
  app.useStaticAssets(join(__dirname, '..', 'frontend', 'dist'), {
    prefix: '/',
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();