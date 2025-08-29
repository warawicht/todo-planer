import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  
  // Serve static files from the frontend build
  app.useStaticAssets(join(__dirname, '..', 'frontend', 'dist'), {
    prefix: '/',
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();