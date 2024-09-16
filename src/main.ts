// Imports
import * as express from 'express';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { Env } from './constants/env.config';

async function bootstrap() {
  process.env.TZ = 'Asia/Kolkata';

  const app = await NestFactory.create(AppModule, {
    httpsOptions: null,
    cors: true,
  });
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));
  app.enableCors();

  await app.listen(Env.server.port);
  console.log(
    `App started running on port ${Env.server.port} at -> `,
    new Date().toString(),
  );
}

bootstrap();
