// Imports
import { Module } from '@nestjs/common';
import { TestService } from './test/test.service';
import { UtilsModule } from 'src/utils/utils.module';
import { LiveServiceV1 } from './live/live.service.v1';
import { SharedModule } from 'src/shared/shared.module';
import { MarketService } from './market/market.service';
import { TestController } from './test/test.controller';
import { LiveControllerV1 } from './live/live.controller.v1';
import { ManualServiceV1 } from './manual/manual.service.v1';
import { DatabaseModule } from 'src/database/database.module';
import { MarketController } from './market/market.controller';
import { ManualControllerV1 } from './manual/manual.controller.v1';
import { ThirdPartyModule } from 'src/thirdparty/thirdparty.module';

@Module({
  imports: [DatabaseModule, SharedModule, ThirdPartyModule, UtilsModule],
  controllers: [
    LiveControllerV1,
    MarketController,
    ManualControllerV1,
    TestController,
  ],
  exports: [LiveServiceV1],
  providers: [LiveServiceV1, MarketService, ManualServiceV1, TestService],
})
export class V1Module {}
