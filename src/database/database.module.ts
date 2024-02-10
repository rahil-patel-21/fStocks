// Imports
import { Module } from '@nestjs/common';
import { DatabaseManager } from './database.manager';
import { DatabaseProvider } from './configuration/database.provider';

@Module({
  exports: [DatabaseManager],
  providers: [...DatabaseProvider, DatabaseManager],
})
export class DatabaseModule {}
