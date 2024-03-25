// Imports
import { Injectable } from '@nestjs/common';
import { DatabaseManager } from 'src/database/database.manager';
import { StockPricing } from 'src/database/tables/Stock.pricing';

@Injectable()
export class TestService {
  constructor(private readonly db: DatabaseManager) {}

  async predictedStocks(reqData) {
    const stockPricingAttr = ['close', 'closingDiff', 'risk', 'sessionTime'];
    const stockPricingOptions = {
      order: [['sessionTime', 'ASC']],
      where: { stockId: reqData.stockId },
    };

    const pricingList = await this.db.getAll(
      StockPricing,
      stockPricingAttr,
      stockPricingOptions,
    );

    const riskFreeList = pricingList.filter((el) => el.risk === 0);
    let profitCount = 0;
    let lossCount = 0;
    let totalProfitPerc = 0;
    let totalLossPerc = 0;
    for (let index = 0; index < riskFreeList.length; index++) {
      const data = riskFreeList[index];
      const time = data.sessionTime;
      const maxTime = new Date(time);
      maxTime.setMinutes(maxTime.getMinutes() + 10);
      const currentValue = data.close;

      let isProfit = false;
      const nextLap = pricingList.filter(
        (el) =>
          el.sessionTime.getTime() > time.getTime() &&
          el.sessionTime.getTime() <= maxTime.getTime(),
      );
      for (let i = 0; i < nextLap.length; i++) {
        const nextData = nextLap[i];
        const nextValue = nextData.close;
        const perc = (nextValue * 100) / currentValue - 100;
        if (perc >= 1) {
          isProfit = true;
          totalProfitPerc += perc;
          break;
        }
        if (i === nextLap.length - 1) totalLossPerc += perc;
      }

      if (isProfit) profitCount++;
      else {
        console.log(data.close, data.sessionTime.toString());
        lossCount++;
      }
    }

    return {
      avgProfit: totalProfitPerc / profitCount,
      avgLoss: totalLossPerc / lossCount,
      profitCount,
      lossCount,
    };
  }
}
