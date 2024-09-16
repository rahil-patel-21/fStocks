// Imports
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculationSharedService {
  // For 5s interval
  predictRiskV2(rawList, last5MinsList = []) {
    const targetList: any = [...new Set(rawList)];
    let risk = 100;

    let marketOpenRate = 0;
    for (let index = 0; index < targetList.length; index++) {
      // Preparation -> data
      const targetData = targetList[index];
      const close = targetData.close ?? 0;
      const open = targetData.open ?? 0;
      if (index === 0) {
        marketOpenRate = targetData.open;
        continue;
      }

      const closingDiff = (close * 100) / open - 100;
      targetList[index].closingDiff = closingDiff;
      const marketDiff = (close * 100) / marketOpenRate - 100;

      // Last n minute -> Currently one minute

      // Movement -> None
      if (closingDiff === 0) risk -= 2.5;
      // Movement -> Up
      else if (closingDiff > 0 && closingDiff <= 0.025) risk -= 25;
      // Movement -> Up more
      else if (closingDiff > 0.025 && closingDiff <= 0.075) risk -= 40;
      // Movement -> Bullish
      else if (closingDiff > 0.075 && closingDiff <= 0.1) risk -= 55;
      // Movement -> Bullish
      else if (closingDiff > 0.1) risk -= 75;
      // Movement -> Down
      else if (closingDiff < 0 && closingDiff >= -0.05) risk += 10;
      // Movement -> Bearish
      else if (closingDiff < -0.05) risk += 30;

      // Last record
      if (index === targetList.length - 1) {
        // Movement -> Bearish
        if (marketDiff <= 0.25) {
          risk = 100;
          break;
        }
        // Movement -> None
        if (closingDiff === 0) risk += 10;
        // Movement -> Up
        else if (closingDiff > 0 && closingDiff <= 0.025) risk -= 25;
        // Movement -> Bullish
        else if (closingDiff > 0.025) risk -= 55;
        // Movement -> Down
        else if (closingDiff < 0 && closingDiff >= -0.05) risk += 20;
        // Movement -> Bearish
        else if (closingDiff < -0.05) risk = 75;
      }
    }

    // Prevention -> Movement -> Bearish
    const lastRecord = targetList[targetList.length - 1];
    if (risk < 20) {
      let maxCloseValue = 0;
      last5MinsList.forEach((el) => {
        if (el.close > maxCloseValue) maxCloseValue = el.close;
      });
      const last5MinDiff = (lastRecord.close * 100) / maxCloseValue - 100;
      if (last5MinDiff <= -0.25) risk = 50;

      // Prevention -> Movement -> Stable
      if (risk < 0) risk = 0;
      const marketDiff = (lastRecord.close * 100) / marketOpenRate - 100;
      if (marketDiff <= 0.5) risk += 10;
      else {
        const time = lastRecord.sessionTime;
        const hour = time.getHours();
        if (hour === 9 && marketDiff < 1) risk += 5;
        else if (hour > 9 && hour <= 12 && marketDiff < 2.5) risk += 10;
        else if (hour > 12 && marketDiff < 4) risk += 15;
      }
    }

    // Market is about to open or close (Market rush prevention & Auto square off prevention)
    const currentHours = lastRecord.sessionTime.getHours();
    let isClosingDate = false;
    let isOpeningGate = false;
    if (currentHours >= 14 || currentHours == 9) {
      if (currentHours >= 15) isClosingDate = true;
      else {
        const currentMinutes = lastRecord.sessionTime.getMinutes();
        if (currentMinutes >= 30 && currentHours != 9) isClosingDate = true;
        else if (currentHours === 9 && currentMinutes < 20)
          isOpeningGate = true;
      }
    }
    if (isClosingDate || isOpeningGate) risk = 100;

    if (risk > 100) risk = 100;
    else if (risk < 0) risk = 0;

    return risk;
  }

  predict30Sec() {}
}
