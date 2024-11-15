// Imports
import { DhanService } from './dhan.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller('dhan')
export class DhanController {
  constructor(private readonly service: DhanService) {}

  @Get('data')
  async funData(@Query() query) {
    await this.service.getData(query);
  }

  @Get('topValue')
  async funTopValue() {
    return await this.service.topValue();
  }

  @Get('optionChain')
  async funOptionChain(@Query() query) {
    return await this.service.optionChain(query);
  }

  @Post('test')
  async funTest() {
    return await this.service.test();
  }

  @Post('syncOLHC')
  async funSyncOLHC(@Body() body) {
    return await this.service.syncOLHC(body);
  }

  @Get('getOLHC')
  async funGetOLHC(@Query() query) {
    return await this.service.getOLHC(query);
  }

  @Post('liveMarketPrediction')
  async funLiveMarketPrediction() {
    return await this.service.liveMarketPrediction();
  }

  @Get('marketDepth')
  async funMarketDepth(@Query() query) {
    return await this.service.marketDepth(query);
  }

  @Post('watchMarketDepth')
  async funWatchMarketDepth() {
    this.service.watchMarketDepth();
    return {};
  }

  @Get('gainers')
  async funGainers() {
    return await this.service.gainers();
  }
}
