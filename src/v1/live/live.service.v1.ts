// Imports
import { Op, Sequelize } from 'sequelize';
import { Injectable } from '@nestjs/common';
import { FunService } from 'src/utils/fun.service';
import { RawData } from 'src/database/tables/Raw.data';
import { LiveData } from 'src/database/tables/Live.data';
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
    private readonly funService: FunService,
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
      where: { dhanId: { [Op.ne]: null }, id: stockId, isActive: true },
    };
    if (stockId == -1) delete stockOptions.where.id;
    // Hit -> Query
    let targetList = await this.dbManager.getAll(
      StockList,
      ['dhanId', 'id', 'name', 'isInId'],
      stockOptions,
    );
    targetList = this.funService.shuffleArray(targetList);

    // Iterate and git the api
    for (let index = 0; index < targetList.length; index++) {
      const response: any = await this.dhan.getData({
        dhanId: targetList[index].dhanId,
        maxTime: reqData.maxTime,
        targetDate: reqData.targetDate,
        stockId: targetList[index].id,
        stockName: targetList[index].name,
      });
      if (response.valid === true) {
        response.maxTime = reqData.maxTime;
        response.isInId = targetList[index].isInId;
        await this.predictStockMovement(response);
        // Predict response
      } else console.log('ERROR');
    }
  }

  //#region Sync Dhan stock
  async predictStockMovement(reqData) {
    const stockId = reqData.stockId;
    const stockName = reqData.stockName ?? '';

    const bulkList = [];
    for (let index = 0; index < reqData.open.length; index++) {
      // Filtering un necessary past data
      if (index != 0 && reqData.open.length - index > 5) continue;

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

      if (index == reqData.open.length - 1) {
        const last5MinsList = [];
        if (index > 20) {
          for (let i = index - 20; i < index; i++) {
            last5MinsList.push({ close: reqData.close[i] });
          }
        }
        creationData.risk = this.calculation.predictRiskV2(
          targetList,
          last5MinsList,
        );
        if (creationData.risk <= 10) {
          const isInRes = await this.dhan.getIsInData(reqData.isInId);
          if (isInRes.dominantBuy >= 40) {
            console.log('dominantBuy', isInRes.dominantBuy, reqData.isInId);
            const message = `${stockName} \nValue - ${
              creationData.close
            } \nTime - ${creationData.sessionTime
              .toString()
              .replace(' GMT+0530 (India Standard Time)', '')}`;
            this.telegram.sendMessage(message);
          }
        }
      }

      bulkList.push(creationData);
    }

    return {};
  }

  async keepRecords(reqData) {
    const currentTime = new Date();
    currentTime.setHours(10);
    currentTime.setMinutes(8);
    currentTime.setSeconds(0);

    let canClose = false;
    // while (!canClose) {
    currentTime.setSeconds(currentTime.getSeconds() + 4);
    // reqData.maxTime = '10:10';
    //currentTime.toString();
    await this.init(reqData);

    const mins = currentTime.getMinutes();
    if (mins === 15) canClose = true;
    // console.log(mins, currentTime.toString());
    // }
  }

  async scrape() {
    const stockOptions = {
      limit: 50,
      where: {
        dhanId: { [Op.ne]: null },
        isActive: true,
        isInId: { [Op.ne]: null },
      },
    };

    // Hit -> Query
    const targetList = await this.dbManager.getAll(
      StockList,
      ['dhanId', 'id', 'name', 'isInId'],
      stockOptions,
    );

    // Preparation -> Query -> 2
    const stockIds = targetList.map((el) => el.id);
    const today = new Date();
    today.setHours(0);
    let liveDataOptions: any = {
      attributes: [[Sequelize.fn('max', Sequelize.col('id')), 'id']],
      where: { createdAt: { [Op.gt]: today }, stockId: stockIds },
    };
    // Hit -> Query -> 2
    let liveList = await this.dbManager.getAll(LiveData, liveDataOptions);
    const liveDataIds = liveList.map((el) => el.id);
    liveDataOptions = {
      attributes: ['createdAt', 'price', 'stockId'],
      where: { id: liveDataIds },
    };
    // Hit -> Query -> 3
    liveList = await this.dbManager.getAll(LiveData, liveDataOptions);

    const promiseList = [];
    for (let index = 0; index < targetList.length; index++) {
      promiseList.push(this.dhan.getIsInData(targetList[index].isInId));
    }

    try {
      const resultList = await Promise.all(promiseList);

      const finalizedLiveList = [];
      for (let index = 0; index < resultList.length; index++) {
        const currentData = resultList[index];

        const isInId = currentData.isin;
        if (!isInId) continue;
        const targetStockData = targetList.find((el) => el.isInId == isInId);
        if (!targetStockData) continue;
        const pastData = liveList.find(
          (el) => el.stockId == targetStockData.id,
        );
        const creationData = {
          // Price
          price: currentData.Ltp,
          prev_price: pastData?.price,
          price_diff: pastData?.price
            ? (currentData.Ltp * 100) / pastData?.price - 100
            : null,
          // Buy zone
          total_buy: currentData.t_b_qt,
          prev_total_buy: pastData?.total_buy,
          buy_diff:
            pastData?.total_buy != null && pastData?.total_buy != undefined
              ? pastData?.total_buy == 0
                ? 0
                : (currentData.t_b_qt * 100) / pastData?.total_buy - 100
              : null,
          // Sell zone
          total_sell: currentData.t_s_qty,
          prev_total_sell: pastData?.total_sell,
          sell_diff:
            pastData?.total_sell != null && pastData?.total_sell != undefined
              ? pastData?.total_sell == 0
                ? 0
                : (currentData.t_s_qty * 100) / pastData?.total_sell - 100
              : null,
          // Join
          stockId: targetStockData.id,
        };
        finalizedLiveList.push(creationData);
      }

      await this.dbManager.bulkInsert(LiveData, finalizedLiveList);
    } catch (error) {}
  }
}
