// Imports
import { Injectable } from '@nestjs/common';
import { FunService } from 'src/utils/fun.service';
import { APIService } from 'src/utils/api.service';
import { DateService } from 'src/utils/date.service';
import { StockList } from 'src/database/tables/Stock.list';
import { DhanService } from 'src/thirdparty/dhan/dhan.service';
import { DatabaseManager } from 'src/database/database.manager';
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
    private readonly dhan: DhanService,
    private readonly telegram: TelegramService,
    // Utils
    private readonly dateService: DateService,
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
      limit: 99,
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

    // Iterate and git the api
    const promiseList = [];
    for (let index = 0; index < targetList.length; index++) {
      promiseList.push(
        this.dhan.getData({
          dhanId: targetList[index].dhanId,
          targetDate: reqData.targetDate,
          stockId: targetList[index].id,
          stockName: targetList[index].name,
        }),
      );
      //break;
    }

    const responseList = await Promise.all(promiseList);

    for (let index = 0; index < responseList.length; index++) {
      try {
        const response = responseList[index];
        if (response.valid === true) {
          response.alert = reqData.alert;
          response.maxTime = reqData.maxTime;
          response.isRealTime = reqData.isRealTime;
          this.syncDhanIndividualStock(response);
          // Predict response
        } else {
          this.telegram.sendMessage(
            `Dhan request failed for id ${response.dhanId}`,
          );
        }
      } catch (error) {
        console.log({ error });
      }
    }
  }

  //#region Sync Dhan stock
  syncDhanIndividualStock(reqData) {
    const stockId = reqData.stockId;
    const stockName = reqData.stockName ?? '';
    const maxTime = reqData.maxTime;
    const alert = reqData.alert === true;
    const isRealTime = reqData.realTime ?? true;

    const bulkList = [];
    const today = new Date();
    for (let index = 0; index < reqData.open.length; index++) {
      // Filtering un necessary past data
      if (index != 0 && reqData.open.length - index > 13 && !maxTime) continue;

      const date = new Date(reqData.time[index] * 1000);
      const creationData = {
        risk: 100,
        stockId,
        sessionTime: date,
        open: reqData.open[index],
        close: reqData.close[index],
        closingDiff: parseFloat(
          (
            ((reqData.close[index] - reqData.open[index]) * 100) /
            reqData.open[index]
          ).toFixed(2),
        ),
      };
      // Prediction to buy stock
      const targetList = bulkList;
      targetList.push(creationData);

      if (maxTime && creationData.sessionTime.toString().includes(maxTime)) {
        creationData.risk = this.calculation.predictRiskV2(targetList);
        if (creationData.risk == 0 && alert) {
          const message = `${stockName} \nValue - ${
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
          (diffInSecs <= 9 || !isRealTime)
        ) {
          const message = `${stockName.name} \nValue - ${
            creationData.close
          } \nTime - ${creationData.sessionTime
            .toString()
            .replace(' GMT+0530 (India Standard Time)', '')}`;
          this.telegram.sendMessage(message);
        }
      }

      bulkList.push(creationData);
    }

    return {};
  }
}
