// Imports
import { Module } from '@nestjs/common';
import { V1Module } from './v1/v1.module';
import { RouterModule } from 'nest-router';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UtilsModule } from './utils/utils.module';
import { DatabaseModule } from './database/database.module';
import { ThirdPartyModule } from './thirdparty/thirdparty.module';

export const routes = [
  {
    path: 'thirdParty',
    module: ThirdPartyModule,
  },
  {
    path: 'v1',
    module: V1Module,
  },
];

@Module({
  imports: [
    DatabaseModule,
    RouterModule.forRoutes(routes),
    ThirdPartyModule,
    UtilsModule,
    V1Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
