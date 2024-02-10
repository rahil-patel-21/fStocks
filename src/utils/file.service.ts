// Imports
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

let targetData: any = {};

@Injectable()
export class FileService {
  async getTargetData() {
    if (targetData.version) return targetData;

    const jsonData = await fs.readFileSync('src/targetData.json', 'utf-8');
    targetData = JSON.parse(jsonData);
    return targetData;
  }
}
