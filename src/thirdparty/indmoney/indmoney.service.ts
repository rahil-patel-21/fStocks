// Imports
import { exec } from 'child_process';
import { Injectable } from '@nestjs/common';
import { APIService } from 'src/utils/api.service';

@Injectable()
export class IndMoneyService {
  constructor(private readonly api: APIService) {}

  async todayGainers() {
    const response = await this
      .executeCommand(`curl 'https://indian-stock-broker.indmoney.com/catalog/listing?category=top_gainer_stock&limit=50&' \
    -H 'accept: */*' \
    -H 'accept-language: en-GB,en;q=0.7' \
    -H 'origin: https://www.indstocks.com' \
    -H 'platform: web' \
    -H 'referer: https://www.indstocks.com/' \
    -H 'sec-ch-ua: "Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"' \
    -H 'sec-ch-ua-mobile: ?1' \
    -H 'sec-ch-ua-platform: "Android"' \
    -H 'sec-fetch-dest: empty' \
    -H 'sec-fetch-mode: cors' \
    -H 'sec-fetch-site: cross-site' \
    -H 'sec-gpc: 1' \
    -H 'user-agent: Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36'`);

    if (JSON.parse(response).data) {
      const targetList = JSON.parse(response).data.filter(
        (el) => el.exchange === 'NSE' && el.category != 'Large Cap',
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

  async executeCommand(command: string): Promise<any> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (stdout) resolve(stdout);
        else if (error) {
          reject(error);
          return;
        } else if (stderr) {
          reject(new Error(stderr));
          return;
        }
      });
    });
  }
}
