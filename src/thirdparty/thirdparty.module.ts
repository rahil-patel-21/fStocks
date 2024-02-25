// Imports
import { Module } from '@nestjs/common';
import { APIService } from 'src/utils/api.service';
import { YahooService } from './yahoo/yahoo.service';
import { YahooController } from './yahoo/yahoo.controller';
import { AngleOneService } from './angelOne/angle.one.service';
import { AngleOneController } from './angelOne/angle.one.controller';

@Module({
  controllers: [AngleOneController, YahooController],
  providers: [AngleOneService, APIService, YahooService],
})
export class ThirdPartyModule {}
