// Imports
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndMoneyService {
  constructor() {}

  async todayGainers() {
    const responseStr = await fs.readFileSync('./gainer.json', 'utf-8');
    const response = JSON.parse(responseStr);

    if (response.data) {
      const targetList = response.data.filter(
        (el) =>
          el.exchange === 'NSE' &&
          el.category == 'Small Cap' &&
          el.change <= 10 &&
          el.price <= 2000,
      );
      targetList.forEach((el) => {
        delete el.companyCode;
        delete el.catalogVendorCode;
        delete el.name_alias;
        delete el.exchange;
        delete el.navlinks;
        delete el.logo;
        delete el.fallback_logo;
        delete el.firebase_path;
        delete el.socket_path;
        delete el.relativepath;
        delete el.isin;
        delete el.ind_key;
        delete el.entity_type;
        delete el.newsData;
        delete el.trading;
        delete el.technical;
        delete el.total_analysts;
      });
      return targetList;
    }

    return [];
  }
}
