// Imports
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Cron('*/15 * * * * *')
  handleCron() {
    console.log('Cron triggered on -> ', new Date().toString());
    // Your cron job logic goes here
  }
}
