// Imports
import { ManualServiceV1 } from './manual.service.v1';
import { Body, Controller, Post, Res } from '@nestjs/common';

@Controller('manual')
export class ManualControllerV1 {
  constructor(private readonly service: ManualServiceV1) {}

  @Post('trackStockList')
  async funTrackStockList(@Body() body, @Res() res) {
    try {
      await this.service.trackStockList(body);
      return res.send({});
    } catch (error) {
      return res.send({});
    }
  }
}
