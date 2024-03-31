// Imports
import { Injectable } from '@nestjs/common';
import { APIService } from 'src/utils/api.service';
import { DHAN_API_GET_DATA_S } from 'src/constants/string';

@Injectable()
export class DhanService {
  constructor(private readonly api: APIService) {}

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
        INTERVAL: '5S',
      };

      const url = DHAN_API_GET_DATA_S;
      const headers = { 'Content-Type': 'application/json' };
      // Hit -> API
      const response = await this.api.post(url, body, headers);
      const res_data = response?.data;
      const open = res_data?.o;
      const close = res_data?.c;
      const time = res_data?.t;
      if (!open || !open?.length) throw Error();

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
}
