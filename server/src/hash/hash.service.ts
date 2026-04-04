import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class HashService {
  computeHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  verifyHash(buffer: Buffer, expectedHash: string): boolean {
    const computedHash = this.computeHash(buffer);
    return computedHash === expectedHash;
  }
}
