// Imports
import { Injectable } from '@nestjs/common';

@Injectable()
export class FunService {
  delay = (ms) => new Promise((res) => setTimeout(res, ms));

  generateRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
