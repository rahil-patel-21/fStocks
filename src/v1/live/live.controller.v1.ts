// Imports
import { LiveServiceV1 } from './live.service.v1';
import { Controller, Post, Res } from '@nestjs/common';

@Controller('live')
export class LiveControllerV1 {
  constructor(private readonly service: LiveServiceV1) {}

  @Post('init')
  async funInit(@Res() res) {
    try {
      this.service.init();
      return res.send({});
    } catch (error) {
      return res.send({ error });
    }
  }
}
