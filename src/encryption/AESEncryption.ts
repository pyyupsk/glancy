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

import * as crypto from 'crypto';

import type { EncryptionOptions } from './types';

export class AESEncryption {
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;

  constructor(options: EncryptionOptions) {
    // Derive a key using PBKDF2
    const salt = crypto.randomBytes(this.saltLength);
    this.key = crypto.pbkdf2Sync(
      options.key,
      salt,
      100000, // Number of iterations
      32, // Key length in bytes
      'sha512'
    );
  }

  public encrypt(data: string): string {
    try {
      // Generate a random IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      // Encrypt the data
      const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final(),
      ]);

      // Get the auth tag
      const tag = cipher.getAuthTag();

      // Combine IV, encrypted data, and tag
      const result = Buffer.concat([iv, encrypted, tag]);

      // Return as base64 string
      return result.toString('base64');
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to encrypt data'
      );
    }
  }

  public decrypt(data: string): string {
    try {
      // Convert base64 string back to buffer
      const buffer = Buffer.from(data, 'base64');

      // Extract IV, encrypted data, and tag
      const iv = buffer.subarray(0, this.ivLength);
      const tag = buffer.subarray(buffer.length - this.tagLength);
      const encrypted = buffer.subarray(
        this.ivLength,
        buffer.length - this.tagLength
      );

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(tag);

      // Decrypt the data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to decrypt data'
      );
    }
  }
}
