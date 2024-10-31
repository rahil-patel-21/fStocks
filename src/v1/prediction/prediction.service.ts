// Imports
import { Injectable } from '@nestjs/common';
import { LiveData } from 'src/database/tables/Live.data';
import { DatabaseManager } from 'src/database/database.manager';

@Injectable()
export class PredictionService {
  constructor(private readonly db: DatabaseManager) {}

  async predictLiveStock() {
    const attributes = [
      'id',
      'price',
      'createdAt',
      'price_diff',
      'buy_diff',
      'sell_diff',
    ];
    const options = {
      order: [['id', 'ASC']],
      where: { stockId: 522 },
    };

    const liveList = await this.db.getAll(LiveData, attributes, options);
    for (let index = 0; index < liveList.length; index++) {
      const liveData = liveList[index];
      const buy_diff = liveData.buy_diff ?? 0;
      const sell_diff = liveData.sell_diff ?? 0;
      const price_diff = liveData.price_diff ?? 0;

      // Find buy dominance
      if (buy_diff >= 0 && price_diff >= 0) {
        if (sell_diff <= 0 || sell_diff < buy_diff) {
          // Risky time
          const hours = liveData.createdAt.getHours();
          if (hours === 9) {
            const minutes = liveData.createdAt.getMinutes();
            if (minutes < 20) continue;
          }

          const time = liveData.createdAt.toString();
          const targetList = liveList.filter((el) => el.id <= liveData.id);
          const isProfitable = this.isProfitable(targetList, liveData);
          if (isProfitable === false) continue;

          if (!isProfitable) break;
          break;
        }
      }
    }
  }

  private isProfitable(targetList, targetData) {
    if (targetList.length < 30) false;

    const firstData = targetList[0];
    const openDiff = (targetData.price * 100) / firstData.price - 100;
    if (openDiff < 0.75 || openDiff > 12) return false;

    const last5MinsList = [];
    for (let index = 0; index < targetList.length; index++) {
      if (index < targetList.length - 61) continue;

      const data = targetList[index];
      last5MinsList.push(data);
    }

    const maxObject = last5MinsList.reduce((max, current) =>
      max.price > current.price ? max : current,
    );
    const diffFromLast5 = (targetData.price * 100) / maxObject.price - 100;
    if (diffFromLast5 < 0) return false;
  }

  isBullish(targetData, time) {
    let firstOpen = 0;
    let totalValue = 0;
    let highSupport = 0;
    for (let index = 0; index < targetData['c'].length; index++) {
      const timeStr = targetData['Time'][index];
      const open = targetData['o'][index];
      const close = targetData['c'][index];
      const high = targetData['h'][index];

      if (index == 0) {
        firstOpen = open;
      }

      const isTargetEl = timeStr.includes(time.substring(0, 19));
      if (isTargetEl) {
        const openToCloseDiff = (close * 100) / open - 100;
        const avgValue = totalValue / (index + 1);
        const avgToCloseDiff = (close * 100) / avgValue - 100;
        const firstOpenToCloseDiff = (close * 100) / firstOpen - 100;
        const highToCloseDiff = Math.abs((close * 100) / high - 100);
        const volume = targetData['v'][index];
        const low = targetData['l'][index];
        const lowToOpenDiff = (open * 100) / low - 100;
        let isBullish = true;
        let reason = 'It is bullish';

        if (openToCloseDiff <= 0.25) {
          isBullish = false;
          reason = 'openToCloseDiff is less than or eq to 0.25';
        } else if (openToCloseDiff <= 0.4 && volume <= 20000) {
          isBullish = false;
          reason =
            'openToCloseDiff is less than or eq to 0.40 with less volume momentum';
        } else if (openToCloseDiff >= 0.75 && volume <= 20000) {
          isBullish = false;
          reason =
            'openToCloseDiff is more than or eq to 1.00 with less volume momentum';
        } else if (avgToCloseDiff <= -20) {
          isBullish = false;
          reason = 'avgToCloseDiff is less than or eq to -20';
        } else if (firstOpenToCloseDiff <= -50) {
          isBullish = false;
          reason = 'firstOpenToCloseDiff is less than or eq to -50';
        } else if (volume < 1000) {
          isBullish = false;
          reason = 'volume is less than or eq to 1k';
        } else if (highToCloseDiff >= 0.3) {
          isBullish = false;
          reason = 'highToCloseDiff is greater than or eq to 3';
        } else if (lowToOpenDiff >= 2) {
          isBullish = false;
          reason = 'lowToOpenDiff is greater than or eq to 2';
        } else if (lowToOpenDiff >= 1 && highToCloseDiff < lowToOpenDiff) {
          isBullish = false;
          reason =
            'lowToOpenDiff is greater than highToCloseDiff which is bearish trend';
        } else if (
          new Date(timeStr).getHours() == 9 &&
          new Date(timeStr).getMinutes() <= 30
        ) {
          isBullish = false;
          reason = 'Too early to get into market';
        } else if (new Date(timeStr).getHours() >= 15) {
          isBullish = false;
          reason = 'Too late to get into market';
        }

        if (isBullish) {
          const prevClose = targetData['c'][index - 1];
          const prevOpen = targetData['o'][index - 1];
          const prevOpenToCloseDiff = (prevClose * 100) / prevOpen - 100;
          const prevCloseToOpenDiff = (prevClose * 100) / open - 100;
          if (prevOpenToCloseDiff <= 0) {
            isBullish = false;
            reason = 'prevOpenToCloseDiff is less than or eq to 0';
          } else if (prevCloseToOpenDiff > 0.1) {
            isBullish = false;
            reason = 'prev close was above current one';
          }
        }

        if (isBullish) {
          let prevMaxHigh = 0;
          let isPrevHighIsRisky = false;
          for (let i = 0; i < targetData['c'].length; i++) {
            if (i < index - 5 || i >= index) continue;

            const prevClose = targetData['c'][i];
            const prevHigh = targetData['h'][i];
            const prevHighToPrevClose = Math.abs(
              (prevClose * 100) / prevHigh - 100,
            );
            if (prevHighToPrevClose > 0.35) {
              isPrevHighIsRisky = true;
            }

            if (prevHigh > prevMaxHigh) prevMaxHigh = prevHigh;
          }
          if (prevMaxHigh >= close) {
            isBullish = false;
            reason = 'Last 5 candles are having higher high values';
          } else if (isPrevHighIsRisky) {
            isBullish = false;
            reason = 'One of Last 5 candle is having risky high closings';
          }
        }

        return {
          isBullish,
          reason,
          close,
          open,
          volume,
          openToCloseDiff,
          avgToCloseDiff,
          firstOpenToCloseDiff,
          firstOpen,
          highToCloseDiff,
          lowToOpenDiff,
        };
      }

      totalValue += close;
      if (high > highSupport) {
        highSupport = high;
      }
    }
  }
}
