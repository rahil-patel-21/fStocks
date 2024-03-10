// Imports
import { DhanService } from './dhan.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('dhan')
export class DhanController {
  constructor(private readonly service: DhanService) {}

  @Get('data')
  async funData(@Query() query) {
    await this.service.getData(query);
  }
}
