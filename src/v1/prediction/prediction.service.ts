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
          console.log({ isProfitable });

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

    console.log({ diffFromLast5, targetData });
  }
}
