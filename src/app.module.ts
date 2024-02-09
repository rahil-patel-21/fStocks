// Imports
import { Module } from '@nestjs/common';
import { V1Module } from './v1/v1.module';
import { RouterModule } from 'nest-router';
import { AppService } from './app.service';
import { AppController } from './app.controller';

export const routes = [
  {
    path: 'v1',
    module: V1Module,
  },
];

@Module({
  imports: [RouterModule.forRoutes(routes), V1Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
