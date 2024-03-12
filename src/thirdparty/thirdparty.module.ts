// Imports
import { Module } from '@nestjs/common';
import { DhanService } from './dhan/dhan.service';
import { APIService } from 'src/utils/api.service';
import { YahooService } from './yahoo/yahoo.service';
import { DhanController } from './dhan/dhan.controller';
import { YahooController } from './yahoo/yahoo.controller';
import { TelegramService } from './telegram/telegram.service';
import { AngleOneService } from './angelOne/angle.one.service';
import { AngleOneController } from './angelOne/angle.one.controller';

@Module({
  controllers: [AngleOneController, DhanController, YahooController],
  exports: [TelegramService],
  providers: [
    AngleOneService,
    APIService,
    DhanService,
    TelegramService,
    YahooService,
  ],
})
export class ThirdPartyModule {}
