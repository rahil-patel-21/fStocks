// Imports
import { Controller, Post, Res } from '@nestjs/common';
import { AngleOneService } from './angle.one.service';

@Controller('angleOne')
export class AngleOneController {
  constructor(private readonly service: AngleOneService) {}

  @Post('generateToken')
  async funGenerateToken(@Res() res) {
    try {
      const data = await this.service.generateToken();
      return res.send({ data });
    } catch (error) {
      return res.send({ error });
    }
  }
}
