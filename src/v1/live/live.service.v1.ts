// Imports
import { Injectable } from '@nestjs/common';
import { FunService } from 'src/utils/fun.service';
import { APIService } from 'src/utils/api.service';
import { FileService } from 'src/utils/file.service';
import { DateService } from 'src/utils/date.service';
import { StockList } from 'src/database/tables/Stock.list';
import { DHAN_API_GET_DATA_S } from 'src/constants/string';
import { DatabaseManager } from 'src/database/database.manager';
import { StockPricing } from 'src/database/tables/Stock.pricing';
import { CalculationSharedService } from 'src/shared/calculation.service';
import { TelegramService } from 'src/thirdparty/telegram/telegram.service';

@Injectable()
export class LiveServiceV1 {
  constructor(
    // Database
    private readonly dbManager: DatabaseManager,
    // Shared
    private readonly calculation: CalculationSharedService,
    // ThirdParty
    private readonly telegram: TelegramService,
    // Utils
    private readonly dateService: DateService,
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
      limit: 50,
      where: { id: stockId, isActive: true },
    };
    if (stockId == -1) delete stockOptions.where.id;
    // Hit -> Query
    let targetList = await this.dbManager.getAll(
      StockList,
      ['dhanId', 'id', 'name'],
      stockOptions,
    );
    targetList = this.funService.shuffleArray(targetList);

    // Iterate
    for (let index = 0; index < targetList.length; index++) {
      try {
        await this.syncDhanIndividualStock(targetList[index], reqData);
      } catch (error) {
        console.log(error);
      }
    }
  }

  //#region Sync Dhan stock
  async syncDhanIndividualStock(stockData, reqData) {
    if (!reqData.targetDate)
      reqData.targetDate = new Date().toJSON().substring(0, 10);

    const targetDate = new Date(reqData.targetDate);
    const startDate = new Date(targetDate);
    // Set to stock market opening time
    startDate.setHours(9);
    startDate.setMinutes(0);
    const endDate = new Date(targetDate);
    // Set to stock market closing time
    endDate.setHours(15);
    endDate.setMinutes(30);
    const maxTime = reqData.maxTime;
    const alert = reqData.alert === true;
    const isRealTime = reqData.realTime ?? true;

    // Preparation -> API
    const body = {
      EXCH: 'NSE',
      SEG: 'E',
      INST: 'EQUITY',
      SEC_ID: stockData.dhanId,
      START: Math.round(startDate.getTime() / 1000),
      START_TIME: startDate.toString(),
      END: Math.round(endDate.getTime() / 1000),
      END_TIME: endDate.toString(),
      INTERVAL: '5S',
    };

    const url = DHAN_API_GET_DATA_S;
    const headers = { 'Content-Type': 'application/json' };
    // Hit -> API
    const response = await this.apiService.post(url, body, headers);
    const res_data = response?.data;
    const open = res_data?.o;
    const high = res_data?.h;
    const low = res_data?.l;
    const close = res_data?.c;
    const time = res_data?.t;
    if (!open || !open?.length) return;

    const bulkList = [];
    const today = new Date();
    for (let index = 0; index < open.length; index++) {
      try {
        const date = new Date(time[index] * 1000);
        const creationData = {
          risk: 100,
          stockId: stockData.id,
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
          uniqueId: stockData.id + '_' + date.getTime(),
        };
        // Prediction to buy stock
        const targetList = bulkList;
        targetList.push(creationData);

        if (maxTime && creationData.sessionTime.toString().includes(maxTime)) {
          creationData.risk = this.calculation.predictRiskV2(targetList);
          if (creationData.risk == 0 && alert) {
            const message = `${stockData.name} \nValue - ${
              creationData.close
            } \nTime - ${creationData.sessionTime
              .toString()
              .replace(' GMT+0530 (India Standard Time)', '')}`;
            this.telegram.sendMessage(message);
          }
          break;
        } else if (!maxTime) {
          creationData.risk = this.calculation.predictRiskV2(targetList);
          const diffInSecs = this.dateService.difference(
            creationData.sessionTime,
            today,
          );
          if (
            creationData.risk == 0 &&
            alert &&
            (diffInSecs <= 10 || !isRealTime)
          ) {
            const message = `${stockData.name} \nValue - ${
              creationData.close
            } \nTime - ${creationData.sessionTime
              .toString()
              .replace(' GMT+0530 (India Standard Time)', '')}`;
            this.telegram.sendMessage(message);
          }
        }

        bulkList.push(creationData);
      } catch (error) {
        console.log({ error });
      }
    }

    // this.dbManager.bulkInsert(StockPricing, [...new Set(bulkList)]);
  }
}
