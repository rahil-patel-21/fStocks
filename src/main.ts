// Imports
import * as express from 'express';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { Env } from './constants/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: null,
    cors: true,
  });
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));
  app.enableCors();

  await app.listen(Env.server.port ?? 3000);
}

bootstrap();
