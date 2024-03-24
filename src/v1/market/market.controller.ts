// Imports
import { MarketService } from './market.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('market')
export class MarketController {
  constructor(private readonly service: MarketService) {}

  @Get('list')
  async funList(@Query() query) {
    return await this.service.list(query);
  }
}
