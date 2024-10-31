// Imports
import { Module } from '@nestjs/common';
import { FunService } from './fun.service';
import { APIService } from './api.service';
import { FileService } from './file.service';
import { DateService } from './date.service';
import { CryptService } from './crypt.service';

@Module({
  exports: [APIService, CryptService, DateService, FileService, FunService],
  providers: [APIService, CryptService, DateService, FileService, FunService],
})
export class UtilsModule {}
