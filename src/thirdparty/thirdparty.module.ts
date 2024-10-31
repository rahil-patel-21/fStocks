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
import { PredictionService } from 'src/v1/prediction/prediction.service';
import { CryptService } from 'src/utils/crypt.service';

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
    CryptService,
    DatabaseManager,
    DhanService,
    IndMoneyService,
    PredictionService,
    TelegramService,
    YahooService,
  ],
})
export class ThirdPartyModule {}
