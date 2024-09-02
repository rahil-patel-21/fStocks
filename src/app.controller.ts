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

  @Cron('*/5 * 9-14 * * 1-5')
  handle5SecCron() {
    if (Env.server.isCronEnabled) this.liveService.scrape();
  }

  @Cron('*/45 * 9-14 * * 1-5')
  handleCronForGainers() {
    if (Env.server.isCronEnabled) this.marketService.syncGainers();
  }
}
