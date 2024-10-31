// Imports
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptService {
  generateMD5Hash(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }
}
