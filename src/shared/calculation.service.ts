// Imports
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculationSharedService {
  predictRisk(rawList, canLog = false) {
    let targetList = [...rawList];
    targetList = [...new Set(targetList)];

    let risk = 100;

    // Do not take risks in first 5 mins
    if (targetList.length <= 5) return risk;

    const marketOpen = targetList[0].open;
    let last2MinsClosingDiff = 0;
    const lastLot = [];
    for (let index = 0; index < targetList.length; index++) {
      const targetData = targetList[index];
      const sessionOpen = targetData.open;
      const closingDiff = targetData.closingDiff;
      if (index === 0) continue;
      const openDiff = (sessionOpen * 100) / marketOpen - 100;

      // Last 2 mins
      if (targetList.length - index <= 8) {
        last2MinsClosingDiff += closingDiff;
        // Buy zone
        if (closingDiff > 0) {
          if (closingDiff < 0.025) risk -= 7.5;
          else if (closingDiff < 0.05) risk -= 10;
          else if (closingDiff < 0.1) risk -= 15;
          else if (closingDiff < 0.25) risk -= 20;
          else if (closingDiff < 0.5) risk -= 25;
          else if (closingDiff < 1) risk -= 30;
          else if (closingDiff < 2) risk -= 15; // Might be on peak
          else if (closingDiff < 3) risk -= 10; // Might be on peak
          // Too late to buy now
          else if (closingDiff > 3) risk += 25;
        }
        //  Stability
        else if (closingDiff === 0) risk += 2.5;
        // Sell zone
        else if (closingDiff <= 0 && closingDiff >= -1) risk += 5;
        else if (closingDiff <= -1 && closingDiff <= -2.5) risk += 7.5;
        else if (closingDiff < -2.5) risk += 15;

        lastLot.push(targetData);
      }

      // Last record
      if (index === targetList.length - 1) {
        // Market is about to open or close (Market rush prevention & Auto square off prevention)
        const currentHours = targetData.sessionTime.getHours();
        let isClosingDate = false;
        let isOpeningGate = false;
        if (currentHours >= 14 || currentHours == 9) {
          if (currentHours >= 15) isClosingDate = true;
          else {
            const currentMinutes = targetData.sessionTime.getMinutes();
            if (currentMinutes >= 30 && currentHours != 9) isClosingDate = true;
            else if (currentHours === 9 && currentMinutes < 20)
              isOpeningGate = true;
          }
        }

        if (!isClosingDate && !isOpeningGate) {
          // Last 2 mins in gaining mode
          if (last2MinsClosingDiff > 0.05 && last2MinsClosingDiff < 0.1)
            risk -= 20;
          else if (last2MinsClosingDiff >= 0.1 && last2MinsClosingDiff < 0.25)
            risk -= 25;
          else if (last2MinsClosingDiff >= 0.25 && last2MinsClosingDiff < 1)
            risk -= 30;
          // Too high (Risky)
          else if (last2MinsClosingDiff > 0.05 && last2MinsClosingDiff < 3) {
            // Sudden high (Great for the investment)
            if (openDiff < 12 && closingDiff > -0.25 && closingDiff < 1)
              risk -= 50;
            //  Risky
            else risk -= 30;
          }

          if (openDiff < 0.5) risk = 100;
          else if (openDiff >= 0.5 && openDiff < 2.5) risk += 15;
          else if (openDiff >= 2.5 && openDiff < 5) risk += 5;
          else if (openDiff >= 5 && openDiff < 7.5) risk -= 5;
          else if (openDiff >= 7.5 && openDiff <= 10) risk -= 10;
          // Too late to buy
          else if (openDiff > 15) {
            if (risk < 0) risk = 0;
            risk += 40;
          }
          // Late to buy
          else if (openDiff > 10) {
            if (risk < 0) risk = 0;
            risk += 30;
          }

          // Last lap Gaining mode
          if (closingDiff > 0.25 && closingDiff < 1) {
            risk -= 30;
            if (closingDiff > 0.4) risk -= 20;
            if (openDiff > 5 && openDiff < 15) risk -= 20;
          }
        } else risk = 100;
      }
    }

    // Prevention -> Avoid sell zone
    let lowRiskCount = 0;
    if (risk <= 20) {
      for (let index = 0; index < lastLot.length; index++) {
        try {
          const lotData = lastLot[index];

          if (lotData.risk != null && lotData.risk != undefined) {
            if (lotData.risk <= 30) lowRiskCount++;
            else if (lotData.risk === 51) risk += 25;
          }
        } catch (error) {}
      }
      const lowRatio = (lowRiskCount * 100) / lastLot.length;
      // 51 indicates that previous value might on peak
      if (lowRatio >= 50) risk = 51;

      // Prevention -> Check high value in last 5 mins
      if (risk <= 20) {
        const lastData = targetList[targetList.length - 1];
        const lastTime = lastData.sessionTime;
        const minTime = new Date(lastTime);
        minTime.setMinutes(minTime.getMinutes() - 5);
        const last5minsLot = targetList.filter(
          (el) =>
            el.sessionTime.getTime() >= minTime.getTime() &&
            el.sessionTime.getTime() < lastTime.getTime(),
        );
        if (last5minsLot.length > 15) {
          let maxCloseValue = 0;
          last5minsLot.forEach((el) => {
            if (el.close > maxCloseValue) maxCloseValue = el.close;
          });
          const diffIn5Mins = (lastData.close * 100) / maxCloseValue - 100;
          if (canLog) console.log({ marketOpen, diffIn5Mins });
          // Stock price is in downfall
          if (diffIn5Mins <= 0.25) {
            if (risk < 0) risk = 0;
            risk += 50;
          }
        }
      }
    }

    if (risk < 0) risk = 0;
    else if (risk > 100) risk = 100;

    if (canLog) console.log({ risk });

    return risk;
  }

  // For 5s interval
  predictRiskV2(rawList) {
    const targetList: any = [...new Set(rawList)];
    let risk = 100;

    let marketOpenRate = 0;
    for (let index = 0; index < targetList.length; index++) {
      // Preparation -> data
      const targetData = targetList[index];
      const close = targetData.close ?? 0;
      if (index === 0) {
        marketOpenRate = targetData.open;
        continue;
      }
      const prevTargetData = targetList[index - 1];
      const prevClose = prevTargetData.close ?? 0;

      const closingDiff = (close * 100) / prevClose - 100;
      targetList[index].closingDiff = closingDiff;
      const marketDiff = (close * 100) / marketOpenRate - 100;

      // Last n minute -> Currently one minute
      if (targetList.length - 1 - index <= 12 * 1) {
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
      }

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
    if (risk < 20) {
      const lastRecord = targetList[targetList.length - 1];
      const last5MinsList = targetList.filter(
        (el) => el.sessionTime.getTime() - lastRecord.sessionTime.getTime(),
      );
      let maxCloseValue = 0;
      last5MinsList.forEach((el) => {
        if (el.close > maxCloseValue) maxCloseValue = el.close;
      });
      const last5MinDiff = (lastRecord.close * 100) / maxCloseValue - 100;
      if (last5MinDiff <= -0.25) risk = 50;
      else if (lastRecord.closingDiff >= 0.025) {
        // Movement -> Recovery
        if (lastRecord.low >= lastRecord.open) risk -= 10;
        else risk = 50;
      } else risk = 50;

      // Market is about to open or close (Market rush prevention & Auto square off prevention)
      if (risk < 20) {
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
      }

      // Prevention -> Movement -> Stable
      if (risk < 20) {
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
    }

    if (risk > 100) risk = 100;
    else if (risk < 0) risk = 0;

    return risk;
  }
}
