// Imports
import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  difference(t1: Date, t2: Date) {
    return (t2.getTime() - t1.getTime()) / 1000;
  }
}
