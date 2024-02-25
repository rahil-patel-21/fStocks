// Imports
import { LiveServiceV1 } from './live.service.v1';
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';

@Controller('live')
export class LiveControllerV1 {
  constructor(private readonly service: LiveServiceV1) {}

  @Post('init')
  async funInit(@Body() body, @Res() res) {
    try {
      this.service.init(body);
      return res.send({});
    } catch (error) {
      return res.send({ error });
    }
  }

  @Post('predict')
  async funPredict(@Body() body, @Res() res) {
    try {
      const data = await this.service.predictStock(body);
      return res.send({ data });
    } catch (error) {
      return res.send({ error });
    }
  }

  @Get('predictPerformance')
  async funPredictPerformance(@Query() query, @Res() res) {
    try {
      const data = await this.service.predictPerformance(query);
      return res.send({ data });
    } catch (error) {
      console.log({ error });
      return res.send({ error });
    }
  }
}
