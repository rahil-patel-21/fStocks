// Imports
import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';
import { LiveServiceV1 } from './live/live.service.v1';
import { LiveControllerV1 } from './live/live.controller.v1';

@Module({
  imports: [UtilsModule],
  controllers: [LiveControllerV1],
  providers: [LiveServiceV1],
})
export class V1Module {}
