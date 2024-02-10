// Imports
import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { FileService } from 'src/utils/file.service';

@Injectable()
export class LiveServiceV1 {
  constructor(private readonly fileService: FileService) {}

  async init() {
    // Get configs
    const targetData = await this.fileService.getTargetData();

    // Connect to origin
    const browserWSEndpoint = targetData.browserWSEndpoint;
    const browser = await puppeteer.connect({ browserWSEndpoint });
    const page = (await browser.pages())[0];

    // Go to target page
    await page.goto('', { waitUntil: 'networkidle0' });
    await page.waitForSelector(`img[alt="${targetData.pageLoadId}"]`);

    // Add listener
    await page.on('response', (response) => {
      if (response.url().includes(targetData.graphEndpoint)) {
        console.log(response.url());
      }
    });
    await page.click(`img[alt="${targetData.pageLoadId}"]`);
  }
}
