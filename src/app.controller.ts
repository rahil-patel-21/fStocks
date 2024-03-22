// Imports
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';
import { LiveServiceV1 } from './v1/live/live.service.v1';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly liveService: LiveServiceV1,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Cron('*/12 * * * * *')
  handleCron() {
    this.liveService.init({ alert: true, stockId: -1 });
    console.log('Cron triggered on -> ', new Date().toString());
  }
}
