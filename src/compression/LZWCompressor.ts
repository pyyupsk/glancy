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

import type { CompressionOptions } from './types';

import { CompressionError } from '../utils/errors';

export class LZWCompressor {
  private readonly dictionarySize: number;

  constructor(options: CompressionOptions) {
    this.dictionarySize = options.dictionarySize;
  }

  /**
   * Compresses data using LZW compression algorithm with adaptive dictionary
   * @param input The string to compress
   * @returns Compressed string in a custom binary format
   */
  public compressData(input: string): string {
    const dict = new Map<string, number>();
    const result: number[] = [];
    let dictSize = 256;

    // Initialize dictionary with single characters
    for (let i = 0; i < 256; i++) {
      dict.set(String.fromCharCode(i), i);
    }

    let current = '';
    const buffer: number[] = [];

    for (const char of input) {
      const phrase = current + char;
      if (dict.has(phrase)) {
        current = phrase;
      } else {
        // Output code for current
        result.push(dict.get(current)!);
        buffer.push(dict.get(current)!);

        // Add phrase to dictionary if there's room
        if (dictSize < this.dictionarySize) {
          dict.set(phrase, dictSize++);
        } else {
          // Adaptive dictionary reset and rebuild
          this.rebuildDictionary(dict, buffer);
          dictSize = 256 + buffer.length;
        }
        current = char;
      }
    }

    if (current !== '') {
      result.push(dict.get(current)!);
    }

    // Convert to binary string with metadata
    const compressionMeta = {
      originalSize: input.length,
      compressedSize: result.length,
      algorithm: 'LZW-ADAPTIVE',
      dictionarySize: this.dictionarySize,
    };

    // Pack the compressed data efficiently
    const packedData = this.packCompressedData(result);

    return JSON.stringify({
      data: packedData,
      meta: compressionMeta,
    });
  }

  /**
   * Decompresses data using LZW decompression with adaptive dictionary
   * @param input The compressed string to decompress
   * @returns Original decompressed string
   */
  public decompressData(input: string): string {
    const { data: packedData } = JSON.parse(input);
    const compressed = this.unpackCompressedData(packedData);

    const dict: string[] = [];
    let dictSize = 256;

    // Initialize dictionary with single characters
    for (let i = 0; i < 256; i++) {
      dict[i] = String.fromCharCode(i);
    }

    let result = '';
    let current = String.fromCharCode(compressed[0]);
    result += current;

    for (let i = 1; i < compressed.length; i++) {
      const code = compressed[i];
      let entry: string;

      if (code < dict.length) {
        entry = dict[code];
      } else if (code === dictSize) {
        entry = current + current[0];
      } else {
        throw new CompressionError('Invalid compressed data');
      }

      result += entry;

      // Add to dictionary if there's room
      if (dictSize < this.dictionarySize) {
        dict[dictSize++] = current + entry[0];
      } else {
        // Adaptive dictionary management
        this.rebuildDecompressionDictionary(dict, result);
        dictSize = 256 + Math.floor(result.length / 2);
      }

      current = entry;
    }

    return result;
  }

  /**
   * Rebuilds the compression dictionary using frequency analysis
   * @param dict The current dictionary
   * @param buffer Recent compression history
   */
  private rebuildDictionary(dict: Map<string, number>, buffer: number[]): void {
    dict.clear();
    // Reinitialize with ASCII
    for (let i = 0; i < 256; i++) {
      dict.set(String.fromCharCode(i), i);
    }

    // Analyze frequent patterns
    const patterns = this.analyzePatterns(buffer);
    let dictSize = 256;

    // Add most frequent patterns back to dictionary
    for (const [pattern] of patterns) {
      if (dictSize < this.dictionarySize) {
        dict.set(pattern, dictSize++);
      }
    }
  }

  /**
   * Rebuilds the decompression dictionary using pattern analysis
   * @param dict The current dictionary
   * @param decompressed Recently decompressed data
   */
  private rebuildDecompressionDictionary(
    dict: string[],
    decompressed: string
  ): void {
    // Keep ASCII entries
    const newDict = Array.from({ length: 256 }, (_, i) =>
      String.fromCharCode(i)
    );

    // Find and add common patterns
    const patterns = this.findCommonPatterns(decompressed);
    for (const pattern of patterns) {
      if (newDict.length < this.dictionarySize) {
        newDict.push(pattern);
      }
    }

    // Update dictionary
    dict.length = 0;
    dict.push(...newDict);
  }

  /**
   * Analyzes patterns in the compression buffer
   * @param buffer Compression history buffer
   * @returns Array of [pattern, frequency] pairs
   */
  private analyzePatterns(buffer: number[]): [string, number][] {
    const patterns = new Map<string, number>();

    // Sliding window analysis
    for (let i = 0; i < buffer.length - 1; i++) {
      const pattern = String.fromCharCode(buffer[i], buffer[i + 1]);
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    }

    return Array.from(patterns.entries()).sort((a, b) => b[1] - a[1]);
  }

  /**
   * Finds common patterns in decompressed data
   * @param data Decompressed string
   * @returns Array of common patterns
   */
  private findCommonPatterns(data: string): string[] {
    const patterns = new Map<string, number>();
    const windowSize = 3;

    for (let i = 0; i < data.length - windowSize + 1; i++) {
      const pattern = data.slice(i, i + windowSize);
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    }

    return Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([pattern]) => pattern);
  }

  /**
   * Packs compressed data into an efficient binary string
   * @param data Array of compression codes
   * @returns Packed binary string
   */
  private packCompressedData(data: number[]): string {
    const bits = Math.ceil(Math.log2(this.dictionarySize));
    let binary = '';

    for (const code of data) {
      binary += code.toString(2).padStart(bits, '0');
    }

    // Pack binary string into UTF-16 characters
    const packed: string[] = [];
    for (let i = 0; i < binary.length; i += 16) {
      const chunk = binary.slice(i, i + 16);
      packed.push(String.fromCharCode(parseInt(chunk.padEnd(16, '0'), 2)));
    }

    return packed.join('');
  }

  /**
   * Unpacks compressed data from binary string
   * @param packed Packed binary string
   * @returns Array of compression codes
   */
  private unpackCompressedData(packed: string): number[] {
    let binary = '';
    const bits = Math.ceil(Math.log2(this.dictionarySize));

    // Unpack UTF-16 characters to binary
    for (const char of packed) {
      binary += char.charCodeAt(0).toString(2).padStart(16, '0');
    }

    // Convert binary chunks back to numbers
    const codes: number[] = [];
    for (let i = 0; i < binary.length; i += bits) {
      const chunk = binary.slice(i, i + bits);
      if (chunk.length === bits) {
        codes.push(parseInt(chunk, 2));
      }
    }

    return codes;
  }
}
