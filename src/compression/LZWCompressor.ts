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

import { promisify } from 'util';
import * as zlib from 'zlib';

import type { CompressionOptions } from './types';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export class LZWCompressor {
  private readonly level: number;

  constructor(options: CompressionOptions) {
    // Use compression level 6 as a good balance between speed and compression ratio
    this.level = options.compressionLevel || 6;
  }

  /**
   * Compresses data using gzip compression
   * @param input The string to compress
   * @returns Compressed string in base64 format
   */
  public async compressData(input: string): Promise<string> {
    try {
      const buffer = Buffer.from(input, 'utf8');
      const compressed = await gzip(buffer, { level: this.level });

      // Convert to base64 for storage
      const base64 = compressed.toString('base64');

      // Add metadata
      return JSON.stringify({
        data: base64,
        meta: {
          originalSize: input.length,
          compressedSize: compressed.length,
          algorithm: 'gzip',
          level: this.level,
        },
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to compress data'
      );
    }
  }

  /**
   * Decompresses data using gzip decompression
   * @param input The compressed string to decompress
   * @returns Original decompressed string
   */
  public async decompressData(input: string): Promise<string> {
    try {
      const { data: base64 } = JSON.parse(input);
      const compressed = Buffer.from(base64, 'base64');
      const decompressed = await gunzip(compressed);
      return decompressed.toString('utf8');
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to decompress data'
      );
    }
  }
}
