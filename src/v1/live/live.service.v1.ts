// Imports
import { Op } from 'sequelize';
import { gInstance } from 'src/globals';
import { Injectable } from '@nestjs/common';
import { FunService } from 'src/utils/fun.service';
import { FileService } from 'src/utils/file.service';
import { StockList } from 'src/database/tables/Stock.list';
import { DatabaseManager } from 'src/database/database.manager';
import { StockPricing } from 'src/database/tables/Stock.pricing';
import { ThirdPartyTrafficTable } from 'src/database/tables/Thirdparty.traffic.table';
import { APIService } from 'src/utils/api.service';
import { DHAN_API_GET_DATA_S } from 'src/constants/string';

@Injectable()
export class LiveServiceV1 {
  constructor(
    // Database
    private readonly dbManager: DatabaseManager,
    // Utils
    private readonly fileService: FileService,
    private readonly funService: FunService,
    private readonly apiService: APIService,
  ) {}

  async init(reqData) {
    const stockId = reqData.stockId ?? -1;

    // Preparation -> Query
    const expiredTime = new Date();
    const currentTime = new Date();
    // Market open
    if (currentTime.getHours() >= 3 && currentTime.getHours() < 10)
      expiredTime.setMinutes(expiredTime.getMinutes() - 3);
    // Market closed
    else expiredTime.setMinutes(expiredTime.getMinutes() - 30);
    const stockOptions = {
      limit: 60,
      order: [['syncedOn', 'ASC']],
      where: {
        id: stockId,
        [Op.or]: [
          { syncedOn: { [Op.eq]: null } },
          { syncedOn: { [Op.lte]: expiredTime } },
        ],
      },
    };
    if (stockId == -1) delete stockOptions.where.id;
    // Hit -> Query
    const targetList = await this.dbManager.getAll(
      StockList,
      ['id', 'sourceUrl'],
      stockOptions,
    );

    // Iterate
    for (let index = 0; index < targetList.length; index++) {
      await this.syncDhanIndividualStock(targetList[index]);
      // await this.syncIndividualStock(targetList[index]);
    }
  }

  async syncIndividualStock(stockData) {
    // Get configs
    const targetData = await this.fileService.getTargetData();

    // Go to target page
    const page = await gInstance.pupBrowser.newPage();
    await page.goto(stockData.sourceUrl, { waitUntil: 'networkidle0' });
    await page.bringToFront();
    await page.waitForSelector(`img[alt="${targetData.pageLoadId}"]`);

    // Add listener
    await page.on('response', async (response) => {
      if (response.url().includes(targetData.graphEndpoint)) {
        if (response.request().method().toUpperCase() != 'OPTIONS') {
          try {
            const value = await response.json();
            await this.dbManager.insert(ThirdPartyTrafficTable, {
              source: 2,
              type: 2,
              value,
            });
            await this.syncLatestPrice({ value, stockId: stockData.id });
            // Hit -> Query
            await this.dbManager.updateOne(
              StockList,
              { syncedOn: new Date() },
              stockData.id,
            );
          } catch (error) {
            console.log({ error });
          }
        }
      }
    });

    await page.click(`img[alt="${targetData.pageLoadId}"]`);
    await this.funService.delay(
      this.funService.generateRandomValue(1200, 2200),
    );
  }

  //#region Sync Dhan stock
  async syncDhanIndividualStock(stockData) {
    // const start = new Date('2024-03-07T09:10:00+05:30');
    const start = new Date();
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 20);
    // const stockId = 3405;
    const stockId = stockData.id;

    const body = {
      EXCH: 'NSE',
      SEG: 'E',
      INST: 'EQUITY',
      SEC_ID: stockId,
      START: Math.round(start.getTime() / 1000),
      END: Math.round(end.getTime() / 1000),
      INTERVAL: '15S',
    };

    const url = DHAN_API_GET_DATA_S;
    const headers = { 'Content-Type': 'application/json' };
    const res = await this.apiService.post(url, body, headers);

    const res_data = res?.data;
    const open = res_data?.o;
    const high = res_data?.h;
    const low = res_data?.l;
    const close = res_data?.c;
    const time = res_data?.t;
    if (!open || !open?.length) return;
    const bulkList = [];
    for (let index = 0; index < open.length; index++) {
      try {
        const date = new Date(time[index] * 1000);
        const creationData = {
          invest: 0,
          risk: 0,
          stockId: stockId,
          sessionTime: date,
          open: open[index],
          close: close[index],
          closingDiff: parseFloat(
            (((close[index] - open[index]) * 100) / open[index]).toFixed(2),
          ),
          high: high[index],
          low: low[index],
          volatileDiff: parseFloat(
            (((high[index] - low[index]) * 100) / open[index]).toFixed(2),
          ),
          uniqueId: stockId + '_' + date.getTime(),
        };
        // Prediction to buy stock
        const targetList = bulkList;
        targetList.push(creationData);
        const { invest, risk } = this.predictRisk(targetList);
        creationData.invest = invest;
        creationData.risk = risk;

        bulkList.push(creationData);
      } catch (error) {}
    }

    await this.dbManager.bulkInsert(StockPricing, bulkList);
    await this.dbManager.updateOne(
      StockList,
      { syncedOn: new Date() },
      stockData.id,
    );
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
        const targetList = bulkList;
        targetList.push(creationData);
        const { invest, risk } = this.predictRisk(targetList);
        creationData.invest = invest;
        creationData.risk = risk;

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

  async predictPerformance(reqData) {
    let targetDateTime = reqData.targetDateTime;
    targetDateTime = targetDateTime.replace(' 05:30', '+05:30');
    const minTargetDateTime = new Date(targetDateTime);
    minTargetDateTime.setMinutes(minTargetDateTime.getMinutes() - 5);
    const maxTargetDateTime = new Date(targetDateTime);

    // Preparation -> Query
    const stockPricingInclude: any = { model: StockPricing };
    stockPricingInclude.where = {
      sessionTime: { [Op.gte]: minTargetDateTime, [Op.lte]: maxTargetDateTime },
    };
    stockPricingInclude.order = [['stockPricingList.id', 'DESC']];
    stockPricingInclude.attributes = ['id', 'invest', 'risk'];
    const include = [stockPricingInclude];
    const stockListAttr = ['id', 'name'];
    const stockListOptions = {
      include,
      where: { isActive: true },
    };
    // Hit -> Query
    const targetList = await this.dbManager.getAll(
      StockList,
      stockListAttr,
      stockListOptions,
    );

    const finalizedList = [];
    for (let index = 0; index < targetList.length; index++) {
      try {
        const targetData = targetList[index];
        const stockPricingList = targetData.stockPricingList ?? [];
        let score = 10;
        stockPricingList.forEach((el, index) => {
          if (index == 0 && el.risk > 50) score -= 2.5;
          if (index == 0 && el.invest < 75) score -= 2.5;
          if (el.risk > 75) score--;
          else if (el.risk > 50) score -= 0.5;
          else if (el.risk > 25) score -= 0.25;
          if (el.invest < 25) score -= 0.5;
          else if (el.invest < 50) score -= 0.25;
        });
        finalizedList.push({
          name: targetData.name,
          invest: stockPricingList[0].invest,
          risk: stockPricingList[0].risk,
          score,
        });
      } catch (error) {}
    }

    finalizedList.sort((b, a) => a.score - b.score);
    return finalizedList;
  }
}
