// Imports
import { gInstance } from 'src/globals';
import { Injectable } from '@nestjs/common';
import { FileService } from 'src/utils/file.service';
import { StockList } from 'src/database/tables/Stock.list';
import { DatabaseManager } from 'src/database/database.manager';

@Injectable()
export class ManualServiceV1 {
  constructor(
    // Database
    private readonly dbManager: DatabaseManager,
    // Utils
    private readonly fileService: FileService,
  ) {}

  async trackStockList(reqData) {
    const maxValue = reqData.maxValue ?? 500;

    const page = (await gInstance.pupBrowser.pages())[0];
    await page.setViewport({ width: 1460, height: 1080 });

    // Get configs
    const targetData = await this.fileService.getTargetData();
    // Add listener
    await page.on('response', async (response) => {
      if (
        response.url().includes(targetData.listingEndpoint) &&
        response.request().method().toUpperCase() != 'OPTIONS'
      ) {
        const body = await response.json();
        if (Array.isArray(body.data)) {
          const creationList = [];
          for (let index = 0; index < body.data.length; index++) {
            try {
              const el = body.data[index];
              if (!el?.price || el?.price > maxValue) continue;
              if (!el.navlinks.web) continue;

              creationList.push({
                isActive: true,
                name: el.name,
                source: 1,
                sourceUrl: el.navlinks.web,
              });
            } catch (error) {}
          }
          // Hit -> Query
          await this.dbManager.bulkInsert(StockList, creationList);
        }
      }
    });
  }
}
