// Imports
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';
import { Env } from './constants/env.config';
import { Controller, Get } from '@nestjs/common';
import { LiveServiceV1 } from './v1/live/live.service.v1';
import { MarketService } from './v1/market/market.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly liveService: LiveServiceV1,
    private readonly marketService: MarketService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Cron('*/4 * 9-14 * * 1-5')
  handleCron() {
    if (!Env.server.isCronEnabled) {
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
        this.liveService.init({ alert: true, stockId: -1 });
      }
    }
  }

  @Cron('*/30 * 9-14 * * 1-5')
  handleCronForGainers() {
    if (Env.server.isCronEnabled) {
      const today = new Date();
      const hours = today.getHours();

      let isMarketTime = false;
      if (hours >= 9 && hours <= 15) isMarketTime = true;
      if (isMarketTime) this.marketService.syncGainers();
    }
  }
}
