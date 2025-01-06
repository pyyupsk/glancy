import * as CryptoJS from 'crypto-js';

import type { EncryptionOptions } from './types';

import { EncryptionError } from '../utils/errors';

export class AESEncryption {
  private readonly key: string;

  constructor(options: EncryptionOptions) {
    this.key = options.key;
  }

  public encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.key).toString();
    } catch (error) {
      throw new EncryptionError(
        error instanceof Error ? error.message : (error as string)
      );
    }
  }

  public decrypt(data: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new EncryptionError(
        error instanceof Error ? error.message : (error as string)
      );
    }
  }
}
