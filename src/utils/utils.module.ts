// Imports
import { Module } from '@nestjs/common';
import { FunService } from './fun.service';
import { FileService } from './file.service';

@Module({
  exports: [FileService, FunService],
  providers: [FileService, FunService],
})
export class UtilsModule {}
