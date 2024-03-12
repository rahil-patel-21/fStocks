// Imports
import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';
import { LiveServiceV1 } from './live/live.service.v1';
import { SharedModule } from 'src/shared/shared.module';
import { LiveControllerV1 } from './live/live.controller.v1';
import { ManualServiceV1 } from './manual/manual.service.v1';
import { DatabaseModule } from 'src/database/database.module';
import { ManualControllerV1 } from './manual/manual.controller.v1';
import { ThirdPartyModule } from 'src/thirdparty/thirdparty.module';

@Module({
  imports: [DatabaseModule, SharedModule, ThirdPartyModule, UtilsModule],
  controllers: [LiveControllerV1, ManualControllerV1],
  providers: [LiveServiceV1, ManualServiceV1],
})
export class V1Module {}
