// Imports
import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { FileService } from 'src/utils/file.service';
import { DatabaseManager } from 'src/database/database.manager';
import { ThirdPartyTrafficTable } from 'src/database/tables/Thirdparty.traffic.table';

@Injectable()
export class LiveServiceV1 {
  constructor(
    // Database
    private readonly dbManager: DatabaseManager,
    // Utils
    private readonly fileService: FileService,
  ) {}

  async init() {
    // Get configs
    const targetData = await this.fileService.getTargetData();

    // Connect to origin
    const browserWSEndpoint = targetData.browserWSEndpoint;
    const browser = await puppeteer.connect({ browserWSEndpoint });
    const page = (await browser.pages())[0];

    // Go to target page
    await page.goto('', { waitUntil: 'networkidle0' });
    await page.waitForSelector(`img[alt="${targetData.pageLoadId}"]`);
    await page.click(`img[alt="${targetData.pageLoadId}"]`);

    // Add listener
    await page.on('response', async (response) => {
      if (response.url().includes(targetData.graphEndpoint)) {
        if (response.request().method().toUpperCase() != 'OPTIONS') {
          await this.dbManager.insert(ThirdPartyTrafficTable, {
            source: 2,
            type: 2,
            value: await response.json(),
          });
        }
      }
    });
    await page.click(`img[alt="${targetData.pageLoadId}"]`);
  }
}
