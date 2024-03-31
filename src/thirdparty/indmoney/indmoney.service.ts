// Imports
import * as fs from 'fs';
import { exec } from 'child_process';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndMoneyService {
  constructor() {}

  async todayGainers() {
    const responseStr = await fs.readFileSync('./gainer.json', 'utf-8');
    const response = JSON.parse(responseStr);

    if (response.data) {
      const targetList = response.data.filter(
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
      console.log('Gainer list', targetList.length);
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
