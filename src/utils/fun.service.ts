// Imports
import { Injectable } from '@nestjs/common';

@Injectable()
export class FunService {
  delay = (ms) => new Promise((res) => setTimeout(res, ms));

  generateRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements using destructuring assignment
    }
    return array;
  }
}
