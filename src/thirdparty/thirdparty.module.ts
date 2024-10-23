// Imports
import { Module } from '@nestjs/common';
import { DhanService } from './dhan/dhan.service';
import { APIService } from 'src/utils/api.service';
import { YahooService } from './yahoo/yahoo.service';
import { DhanController } from './dhan/dhan.controller';
import { YahooController } from './yahoo/yahoo.controller';
import { TelegramService } from './telegram/telegram.service';
import { AngleOneService } from './angelOne/angle.one.service';
import { TelegramController } from './telegram/telegram.controller';
import { AngleOneController } from './angelOne/angle.one.controller';
import { IndMoneyController } from './indmoney/indmoney.controller';
import { IndMoneyService } from './indmoney/indmoney.service';
import { DatabaseManager } from 'src/database/database.manager';

@Module({
  controllers: [
    AngleOneController,
    DhanController,
    IndMoneyController,
    TelegramController,
    YahooController,
  ],
  exports: [DhanService, IndMoneyService, TelegramService],
  providers: [
    AngleOneService,
    APIService,
    DatabaseManager,
    DhanService,
    IndMoneyService,
    TelegramService,
    YahooService,
  ],
})
export class ThirdPartyModule {}
