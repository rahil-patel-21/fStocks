// Imports
import { DhanService } from './dhan.service';
import { Controller, Get, Post, Query } from '@nestjs/common';

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
  async funOptionChain() {
    return await this.service.optionChain();
  }

  @Post('test')
  async funTest() {
    return await this.service.test();
  }
}
