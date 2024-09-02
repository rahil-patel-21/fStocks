// Imports
import { Controller, Post } from '@nestjs/common';
import { PredictionService } from './prediction.service';

@Controller('predict')
export class PredictionController {
  constructor(private readonly service: PredictionService) {}

  @Post('liveStock')
  async funStock() {
    return await this.service.predictLiveStock();
  }
}
