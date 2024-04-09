// Imports
import { Injectable } from '@nestjs/common';
import { APIService } from 'src/utils/api.service';
import { DHAN_API_GET_DATA_S } from 'src/constants/string';
import { nDhanIsInData, nDhanSmartSearch } from 'src/constants/network';

@Injectable()
export class DhanService {
  constructor(private readonly api: APIService) {}

  async getIsInId(shortName) {
    if (!shortName) throw new Error();

    const body = {
      UserType: 'C',
      Source: 'W',
      Data: {
        inst: '',
        searchterm: shortName,
        exch: '',
        optionflag: true,
      },
      broker_code: 'DHN1804',
    };
    const response = await this.api.post(nDhanSmartSearch, body);
    const data = response.data.find((el) => el.d_exch_t === 'NSE');
    return data.ISIN_code_s;
  }

  async getData(reqData) {
    try {
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
      let maxTime = reqData.maxTime;
      if (maxTime && maxTime?.includes(':')) {
        const spans = maxTime.split(':');
        maxTime = new Date(targetDate);
        maxTime.setHours(spans[0]);
        maxTime.setMinutes(spans[1]);
        maxTime.setSeconds(spans[2]);
        maxTime = maxTime.getTime() / 1000;
      } else maxTime = null;

      // Preparation -> API
      const body = {
        EXCH: 'NSE',
        SEG: 'E',
        INST: 'EQUITY',
        SEC_ID: reqData.dhanId,
        START: Math.round(startDate.getTime() / 1000),
        START_TIME: startDate.toString(),
        END: Math.round(endDate.getTime() / 1000),
        END_TIME: endDate.toString(),
        INTERVAL: '15S',
      };

      const url = DHAN_API_GET_DATA_S;
      const headers = { 'Content-Type': 'application/json' };
      // Hit -> API
      const response = await this.api.post(url, body, headers);
      const res_data = response?.data;
      let open = res_data?.o;
      let close = res_data?.c;
      let time = res_data?.t;
      if (!open || !open?.length) return { valid: false };

      if (maxTime && time.includes(maxTime)) {
        let index = time.findIndex((el) => el === maxTime);
        if (index != -1) {
          index++;
          time = time.slice(0, index);
          open = open.slice(0, index);
          close = close.slice(0, index);
        }
      }

      return {
        dhanId: reqData.dhanId,
        valid: true,
        open,
        close,
        time,
        stockId: reqData.stockId,
        stockName: reqData.stockName,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  async getIsInData(isInId) {
    const body = {
      Data: {
        Exch: 1,
        Seg: 1,
        Isin: isInId,
      },
    };

    const response = await this.api.post(nDhanIsInData, body);
    const data = response.data.find((el) => el.u_ex_nm == 'NSE');

    const totalBuy = data.t_b_qt ?? 0;
    const totalSell = data.t_s_qty ?? 0;
    let dominantBuy = 0;
    if (totalSell === 0 || totalBuy === 0) dominantBuy = 0;
    else dominantBuy = (totalBuy * 100) / totalSell - 100;

    data.dominantBuy = dominantBuy;
    return data;
  }
}
