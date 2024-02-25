// Imports
import { Module } from '@nestjs/common';
import { AngleOneService } from './angelOne/angle.one.service';
import { AngleOneController } from './angelOne/angle.one.controller';

@Module({
  controllers: [AngleOneController],
  providers: [AngleOneService],
})
export class ThirdPartyModule {}
