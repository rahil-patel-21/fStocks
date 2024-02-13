// Imports
import { gInstance } from './globals';
import * as puppeteer from 'puppeteer';
import { FileService } from './utils/file.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly fileService: FileService) {}

  async onModuleInit() {
    // Get configs
    const targetData = await this.fileService.getTargetData();

    // Connect to origin
    const browserWSEndpoint = targetData.browserWSEndpoint;
    if (!gInstance.pupBrowser)
      gInstance.pupBrowser = await puppeteer.connect({ browserWSEndpoint });

    console.log('Puppy connected successfully !');
  }

  getHello(): string {
    return '';
  }
}
