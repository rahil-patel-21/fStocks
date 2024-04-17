// Imports
import { LiveServiceV1 } from './live.service.v1';
import { Body, Controller, Post, Res } from '@nestjs/common';

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

  @Post('keepRecords')
  async funKeepRecords(@Body() body, @Res() res) {
    try {
      this.service.keepRecords(body);
      return res.send({});
    } catch (error) {
      return res.send({ error });
    }
  }

  @Post('scrape')
  async funScrape(@Res() res) {
    try {
      this.service.scrape();
      return res.send({});
    } catch (error) {
      return res.send({ error });
    }
  }
}
