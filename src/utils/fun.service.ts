// Imports
import { Injectable } from '@nestjs/common';

@Injectable()
export class FunService {
  delay = (ms) => new Promise((res) => setTimeout(res, ms));
}
