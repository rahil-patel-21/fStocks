// Imports
import { Module } from '@nestjs/common';
import { CalculationSharedService } from './calculation.service';

@Module({
  exports: [CalculationSharedService],
  providers: [CalculationSharedService],
})
export class SharedModule {}
