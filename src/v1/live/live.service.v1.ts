// Imports
import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { FunService } from 'src/utils/fun.service';
import { FileService } from 'src/utils/file.service';
import { StockList } from 'src/database/tables/Stock.list';
import { DatabaseManager } from 'src/database/database.manager';
import { StockPricing } from 'src/database/tables/Stock.pricing';
import { ThirdPartyTrafficTable } from 'src/database/tables/Thirdparty.traffic.table';

let browser: puppeteer.Browser | null = null;

@Injectable()
export class LiveServiceV1 {
  constructor(
    // Database
    private readonly dbManager: DatabaseManager,
    // Utils
    private readonly fileService: FileService,
    private readonly funService: FunService,
  ) {}

  async init() {
    // Hit -> Query
    const targetList = await this.dbManager.getAll(
      StockList,
      ['id', 'sourceUrl'],
      {},
    );
    // Iterate
    for (let index = 0; index < targetList.length; index++) {
      await this.syncIndividualStock(targetList[index]);
    }
  }

  async syncIndividualStock(stockData) {
    // Get configs
    const targetData = await this.fileService.getTargetData();

    // Connect to origin
    const browserWSEndpoint = targetData.browserWSEndpoint;
    if (!browser) browser = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser.newPage();

    // Go to target page
    await page.goto(stockData.sourceUrl, { waitUntil: 'networkidle0' });
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
          await this.syncLatestPrice({ value, stockId: stockData.id });
        }
      }
    });

    await page.click(`img[alt="${targetData.pageLoadId}"]`);
    await this.funService.delay(1200);
  }

  async syncLatestPrice(reqData) {
    const candles = reqData.value.candles ?? [];

    const bulkList = [];
    for (let index = 0; index < candles.length; index++) {
      try {
        const data = candles[index];
        delete data.per;
        const date = new Date(data.ts * 1000);
        const creationData = {
          stockId: reqData.stockId,
          sessionTime: date,
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
        bulkList.push(creationData);
      } catch (error) {}
    }
    // Hit -> Query
    await this.dbManager.bulkInsert(StockPricing, bulkList);
  }
}
