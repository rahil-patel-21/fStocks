// Imports
import { Module } from '@nestjs/common';
import { FunService } from './fun.service';
import { APIService } from './api.service';
import { FileService } from './file.service';

@Module({
  exports: [APIService, FileService, FunService],
  providers: [APIService, FileService, FunService],
})
export class UtilsModule {}
