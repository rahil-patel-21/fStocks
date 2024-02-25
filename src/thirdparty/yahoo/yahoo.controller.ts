// Imports
import { YahooService } from './yahoo.service';
import { Controller, Get, Query, Res } from '@nestjs/common';

@Controller('yahoo')
export class YahooController {
  constructor(private readonly service: YahooService) {}

  @Get('rawData')
  async funRawData(@Query() query, @Res() res) {
    try {
      const data = await this.service.rawData();
      return res.send(data);
    } catch (error) {
      return res.send({ error });
    }
  }
}
