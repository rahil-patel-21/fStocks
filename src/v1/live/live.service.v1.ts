// Imports
import { Op } from 'sequelize';
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
          invest: 0,
          risk: 0,
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
          uniqueId: reqData.stockId + '_' + date.getTime(),
        };
        // Prediction to buy stock
        if (index == candles.length - 1) {
          const targetList = bulkList;
          targetList.push(creationData);
          const { invest, risk } = this.predictRisk(targetList);
          creationData.invest = invest;
          creationData.risk = risk;
        }
        bulkList.push(creationData);
      } catch (error) {}
    }
    // Hit -> Query
    await this.dbManager.bulkInsert(StockPricing, bulkList);
  }

  async predictStock(reqData) {
    // Validation -> Parameters
    const stockId = reqData.stockId;
    if (!stockId) return {};
    const sessionTime = reqData.sessionTime;

    // Preparation -> Query
    const stockPricingAttr = [
      'open',
      'close',
      'closingDiff',
      'high',
      'low',
      'sessionTime',
      'volatileDiff',
    ];
    const stockPricingOptions: any = {
      order: [['sessionTime', 'ASC']],
      where: { stockId },
    };
    if (sessionTime)
      stockPricingOptions.where.sessionTime = { [Op.lte]: sessionTime };
    // Hit -> Query
    const rangeList = await this.dbManager.getAll(
      StockPricing,
      stockPricingAttr,
      stockPricingOptions,
    );

    return this.predictRisk(rangeList);
  }

  predictRisk(rangeList) {
    let risk = 100;
    let invest = 0;
    // Market just opened
    if (rangeList.length <= 1) return { invest, risk };

    // Iterate
    let initialOpenValue = 0;
    let totalCloseValue = 0;
    let avgCloseValue = 0;
    for (let index = 0; index < rangeList.length; index++) {
      const rangeData = rangeList[index];
      if (index == 0) initialOpenValue = rangeData.open;
      totalCloseValue += rangeData.close;
      avgCloseValue = totalCloseValue / (index + 1);

      // Check market slope
      if (rangeData.open < initialOpenValue) {
        risk += 0.4;
        invest -= 0.4;
      } else if (rangeData.open == initialOpenValue) {
        risk += 0.2;
        invest -= 0.2;
      } else if (rangeData.open > initialOpenValue) {
        risk -= 0.4;
        invest += 0.4;
      }

      // Check avg market volatility
      if (rangeData.volatileDiff > 0) risk -= 0.5;
      else risk += 0.5;

      // Checks recent market of last 10 minutes
      if (rangeList.length > 10 && rangeList.length - index <= 10) {
        if (risk <= 0) risk = 0;
        if (invest >= 100) invest = 100;
        const currentDiff =
          ((rangeData.open - avgCloseValue) * 100) / avgCloseValue;
        if (currentDiff < -0.1) {
          risk += 10;
          invest -= 12;
        } else if (currentDiff >= -0.1 && currentDiff <= 0) {
          risk += 5;
          invest -= 6;
        } else if (currentDiff > 0 && currentDiff <= 1) {
          risk -= 10;
          invest += 12;
        } else if (currentDiff > 1 && currentDiff <= 20) {
          risk -= 25;
          invest += 22;
        } else if (currentDiff > 20) {
          risk += 28;
          invest -= 20;
        }
        // Today's current gain / loss
        const todayAvgDiff =
          ((rangeData.close - initialOpenValue) * 100) / initialOpenValue;
        if (todayAvgDiff > 10 || todayAvgDiff < 10) {
          risk += 28;
          invest -= 20;
        }

        // Making sure last minute rush won't comes with bankruptcy
        if (risk < 50 || invest > 75) {
          if (rangeData.closingDiff < -0.25) {
            risk += 10;
            invest -= 12;
          } else if (rangeData.volatileDiff > 2.5) {
            risk += 2;
            invest -= 10;
          }
        }
      }
    }

    // Fine tune the value
    if (risk > 100) risk = 100;
    else if (risk < 0) risk = 0;
    if (invest < 0) invest = 0;
    else if (invest > 100) invest = 100;
    invest = parseFloat(invest.toFixed(2));
    risk = parseFloat(risk.toFixed(2));

    return { invest, risk };
  }
}
