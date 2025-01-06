/*
 * Copyright 2025 Pongsakorn Thipayanate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        error instanceof Error
          ? error.message
          : 'An unknown encryption error occurred'
      );
    }
  }

  public decrypt(data: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new EncryptionError(
        error instanceof Error
          ? error.message
          : 'An unknown encryption error occurred'
      );
    }
  }
}
