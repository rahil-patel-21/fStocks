// Imports
import { Injectable } from '@nestjs/common';
import { APIService } from 'src/utils/api.service';

@Injectable()
export class YahooService {
  constructor(private readonly api: APIService) {}

  async rawData() {
    const url =
      'https://query1.finance.yahoo.com/v8/finance/chart/SINDHUTRAD.NS?region=US&lang=en-US&includePrePost=false&interval=1m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance';
    const response = await this.api.get(url);
    if (!response.chart?.result) throw new Error();

    delete response.chart?.result[0].meta;
    return response.chart?.result[0];
  }
}
