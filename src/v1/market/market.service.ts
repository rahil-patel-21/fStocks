// Imports
import * as fs from 'fs';
import { Op } from 'sequelize';
import { Injectable } from '@nestjs/common';
import { StockList } from 'src/database/tables/Stock.list';
import { DatabaseManager } from 'src/database/database.manager';
import { IndMoneyService } from 'src/thirdparty/indmoney/indmoney.service';
import { TelegramService } from 'src/thirdparty/telegram/telegram.service';

@Injectable()
export class MarketService {
  constructor(
    private readonly dbManager: DatabaseManager,
    // Third party
    private readonly indMoney: IndMoneyService,
    private readonly telegram: TelegramService,
  ) {}

  async list(reqData) {
    const stockAttr = ['name'];
    const stockOptions = { where: { isActive: true } };

    // Hit -> Query
    const targetList = await this.dbManager.getAll(
      StockList,
      stockAttr,
      stockOptions,
    );
    return targetList;
  }

  async syncGainers() {
    const gainerList = await this.indMoney.todayGainers();
    // if (gainerList.length === 0) {
    //   await this.telegram.sendMessage(
    //     `There seems to be technical issue, Please contact Rahil Patel ASAP`,
    //   );
    //   return;
    // }

    const finalizedList = [];
    gainerList.forEach((el) => {
      finalizedList.push({
        name: el.name,
        shortName: el.symbol,
      });
    });

    let dhanData: any = await fs.readFileSync('store/dhan_ids.json', 'utf-8');
    dhanData = JSON.parse(dhanData).data;

    const targetIds = [];
    for (let index = 0; index < finalizedList.length; index++) {
      try {
        const finalizedData = finalizedList[index];
        const stockAttr = ['id'];
        const stockOptions = { where: { name: finalizedData.name } };
        const stockData = await this.dbManager.getOne(
          StockList,
          stockAttr,
          stockOptions,
        );
        if (stockData) {
          targetIds.push(stockData.id);
          continue;
        }

        const dhanIdData = dhanData.find(
          (el) => el['SEM_TRADING_SYMBOL'] === finalizedData.shortName,
        );
        if (!dhanIdData) continue;
        finalizedData.dhanId = dhanIdData['SEM_SMST_SECURITY_ID'];
        if (!finalizedData.dhanId) continue;

        const createdData = await this.dbManager.insert(
          StockList,
          finalizedData,
        );
        targetIds.push(createdData.id);
      } catch (error) {
        console.log({ error });
      }
    }

    // Disable all
    await this.dbManager.updateAll(
      StockList,
      { isActive: false },
      { where: { isActive: true } },
    );

    // active all
    await this.dbManager.updateAll(
      StockList,
      { isActive: true },
      { where: { id: { [Op.in]: targetIds } } },
    );

    return finalizedList;
  }
}
