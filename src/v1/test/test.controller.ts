// Imports
import { TestService } from './test.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('test')
export class TestController {
  constructor(private readonly service: TestService) {}

  @Post('predictedStocks')
  async funPredictedStocks(@Body() body) {
    return await this.service.predictedStocks(body);
  }
}
