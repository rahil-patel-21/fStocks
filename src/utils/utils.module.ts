// Imports
import { Module } from '@nestjs/common';
import { FunService } from './fun.service';
import { APIService } from './api.service';
import { FileService } from './file.service';
import { DateService } from './date.service';

@Module({
  exports: [APIService, DateService, FileService, FunService],
  providers: [APIService, DateService, FileService, FunService],
})
export class UtilsModule {}
