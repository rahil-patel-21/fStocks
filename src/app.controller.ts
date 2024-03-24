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

  @Cron('*/14 * * * * *')
  handleCron() {
    const today = new Date();
    const hours = today.getHours();
    const minutes = today.getMinutes();

    let isMarketTime = false;
    if (hours >= 9 && hours <= 15) {
      if (hours == 9) {
        if (minutes >= 15) isMarketTime = true;
      } else if (hours == 15) {
        if (minutes <= 30) isMarketTime = true;
      } else isMarketTime = true;
    }
    if (isMarketTime) {
      console.log('MARKET IS OPEN');
    }
    // this.liveService.init({ alert: true, stockId: -1 });
  }
}
