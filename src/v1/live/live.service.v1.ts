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
    await page.bringToFront();
    await page.waitForSelector(`img[alt="${targetData.pageLoadId}"]`);

    // Add listener
    await page.on('response', async (response) => {
      if (response.url().includes(targetData.graphEndpoint)) {
        if (response.request().method().toUpperCase() != 'OPTIONS') {
          const value = await response.json();
          await this.dbManager.insert(ThirdPartyTrafficTable, {
            source: 2,
            type: 2,
            value,
          });
          await this.syncLatestPrice({ value });
        }
      }
    });

    await page.click(`img[alt="${targetData.pageLoadId}"]`);
  }

  async syncLatestPrice(reqData) {
    const candles = reqData.value.candles ?? [];

    for (let index = 0; index < candles.length; index++) {
      try {
        const data = candles[index];
        delete data.per;
        const date = new Date(data.ts * 1000);
        const creationData = {
          stockId: reqData.stockId ?? 1,
          date,
          open: data.open,
          close: data.close,
          closingDiff: parseFloat(
            (((data.close - data.open) * 100) / data.open).toFixed(2),
          ),
          high: data.high,
          low: data.low,
          volatileDiff: parseFloat(
            (((data.high - data.low) * 100) / data.open).toFixed(2),
          ),
        };
      } catch (error) {}
    }
  }
}
