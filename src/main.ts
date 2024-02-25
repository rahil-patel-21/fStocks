// Imports
import * as express from 'express';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  console.log('OKAY');
  const app = await NestFactory.create(AppModule, {
    httpsOptions: null,
    cors: true,
  });
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));
  app.enableCors();

  await app.listen(3000);
}

bootstrap();
