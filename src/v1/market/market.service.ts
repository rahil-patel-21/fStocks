// Imports
import { Injectable } from '@nestjs/common';
import { StockList } from 'src/database/tables/Stock.list';
import { DatabaseManager } from 'src/database/database.manager';

@Injectable()
export class MarketService {
  constructor(private readonly dbManager: DatabaseManager) {}

  async list(reqData) {
    const stockAttr = ['name'];
    const stockOptions = { where: { isActive: true } };

    // Hit -> Query
    const targetList = await this.dbManager.getAll(
      StockList,
      stockAttr,
      stockOptions,
    );
    return targetList;
  }
}
