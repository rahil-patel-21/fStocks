// Imports
import { IndMoneyService } from './indmoney.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('indMoney')
export class IndMoneyController {
  constructor(private readonly service: IndMoneyService) {}

  @Post('todayGainers')
  async funTodayGainer(@Body() body) {
    try {
      return await this.service.todayGainers();
    } catch (error) {
      return {};
    }
  }
}
