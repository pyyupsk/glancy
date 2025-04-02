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

import type { GlancyOptions, GlancyItem, GlancyResponse } from '../types';

import { LZWCompressor } from '../compression/LZWCompressor';
import { AESEncryption } from '../encryption/AESEncryption';
import { validateStorageKey, validateTTL } from '../utils/validators';
import { BaseStorage } from './BaseStorage';

export class Glancy extends BaseStorage {
  private readonly compression?: LZWCompressor;
  private readonly encryption?: AESEncryption;
  private readonly defaultTTL?: number;

  constructor(options: GlancyOptions = {}) {
    super(options);
    this.defaultTTL = options.defaultTTL;

    if (options.compress) {
      this.compression = new LZWCompressor({
        compressionLevel: options.compressionLevel || 6,
      });
    }

    if (options.encryption && options.encryption.enabled) {
      this.encryption = new AESEncryption({
        key: options.encryption.key,
      });
    }
  }

  /**
   * Gets a value from storage with automatic decryption and TTL checking
   * @param key The key of the item to retrieve
   * @returns The value associated with the key or null if not found or expired
   */
  public async get<T>(key: string): Promise<GlancyResponse<T>> {
    try {
      const keyValidation = validateStorageKey(key);
      if (!keyValidation.success) {
        return {
          success: false,
          message: keyValidation.message,
          data: null,
        };
      }

      const rawData = localStorage.getItem(this.getNamespacedKey(key));
      if (!rawData) {
        return {
          success: true,
          message: 'Item not found',
          data: null,
        };
      }

      let data = rawData;
      if (this.encryption) {
        data = this.encryption.decrypt(data);
      }

      if (this.compression) {
        data = await this.compression.decompressData(data);
      }

      const item: GlancyItem<T> = JSON.parse(data);
      if (!item || typeof item.value === 'undefined') {
        return {
          success: false,
          message: `Invalid item for key ${key}`,
          data: null,
        };
      }

      if (this.isExpired(item)) {
        this.remove(key);
        return {
          success: true,
          message: 'Item expired',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Item retrieved successfully',
        data: item.value,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error getting item',
        data: null,
      };
    }
  }

  /**
   * Sets a value in storage with optional encryption and TTL
   * @param key The key to associate with the value
   * @param value The value to store
   * @param ttl Optional time-to-live for the item
   */
  public async set<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<GlancyResponse<void>> {
    try {
      const keyValidation = validateStorageKey(key);
      if (!keyValidation.success) {
        return {
          success: false,
          message: keyValidation.message,
          data: undefined,
        };
      }

      const ttlValidation = validateTTL(ttl);
      if (!ttlValidation.success) {
        return {
          success: false,
          message: ttlValidation.message,
          data: undefined,
        };
      }

      const item: GlancyItem<T> = {
        value: value ?? ({} as T),
        timestamp: Date.now(),
        ttl: ttl || this.defaultTTL,
      };

      let serializedData = JSON.stringify(item);

      if (this.compression) {
        serializedData = await this.compression.compressData(serializedData);
      }

      if (this.encryption) {
        serializedData = this.encryption.encrypt(serializedData);
      }

      try {
        localStorage.setItem(this.getNamespacedKey(key), serializedData);
        return {
          success: true,
          message: 'Item set successfully',
          data: undefined,
        };
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'QuotaExceededError'
        ) {
          return {
            success: false,
            message: 'Storage quota exceeded',
            data: undefined,
          };
        }
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Error setting item',
          data: undefined,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error setting item',
        data: undefined,
      };
    }
  }

  /**
   * Gets multiple items at once
   * @param keys An array of keys to retrieve
   * @returns An object mapping keys to their values or null if not found
   */
  public async getMany<T>(
    keys: string[]
  ): Promise<GlancyResponse<Record<string, T | null>>> {
    try {
      const result = await Promise.all(
        keys.map(async (key) => {
          const response = await this.get<T>(key);
          return [key, response.success ? response.data : null];
        })
      );

      const data = Object.fromEntries(result);

      return {
        success: true,
        message: 'Items retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error getting multiple items',
        data: null,
      };
    }
  }

  /**
   * Sets multiple items at once
   * @param items An object mapping keys to values
   * @param ttl Optional time-to-live for the items
   */
  public async setMany<T>(
    items: Record<string, T>,
    ttl?: number
  ): Promise<GlancyResponse<void>> {
    try {
      Object.entries(items).forEach(async ([key, value]) => {
        await this.set(key, value, ttl);
      });
      return {
        success: true,
        message: 'Items set successfully',
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error setting multiple items',
        data: undefined,
      };
    }
  }

  /**
   * Removes an item from storage
   * @param key The key of the item to remove
   */
  public remove(key: string): GlancyResponse<void> {
    try {
      const keyValidation = validateStorageKey(key);
      if (!keyValidation.success) {
        return {
          success: false,
          message: keyValidation.message,
          data: undefined,
        };
      }

      localStorage.removeItem(this.getNamespacedKey(key));
      return {
        success: true,
        message: 'Item removed successfully',
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error removing item',
        data: undefined,
      };
    }
  }

  /**
   * Clears all items in the current namespace
   */
  public clear(): GlancyResponse<void> {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.namespace))
        .forEach((key) => localStorage.removeItem(key));
      return {
        success: true,
        message: 'Storage cleared successfully',
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Error clearing storage',
        data: undefined,
      };
    }
  }

  /**
   * Gets all keys in the current namespace
   * @returns An array of keys in the current namespace
   */
  public keys(): GlancyResponse<string[]> {
    try {
      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith(this.namespace))
        .map((key) => key.replace(`${this.namespace}:`, ''));
      return {
        success: true,
        message: 'Keys retrieved successfully',
        data: keys,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error getting keys',
        data: null,
      };
    }
  }

  /**
   * Checks if a key exists and is not expired
   * @param key The key to check
   * @returns True if the key exists and is not expired, otherwise false
   */
  public async has(key: string): Promise<GlancyResponse<boolean>> {
    try {
      const response = await this.get(key);
      return {
        success: true,
        message: 'Key check completed successfully',
        data: response.success && response.data !== null,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error checking key existence',
        data: false,
      };
    }
  }

  /**
   * Updates the TTL for an existing item
   * @param key The key of the item to update
   * @param ttl Optional new time-to-live for the item
   * @returns True if the TTL was updated, otherwise false
   */
  public async touch(
    key: string,
    ttl?: number
  ): Promise<GlancyResponse<boolean>> {
    try {
      const keyValidation = validateStorageKey(key);
      if (!keyValidation.success) {
        return {
          success: false,
          message: keyValidation.message,
          data: false,
        };
      }

      const ttlValidation = validateTTL(ttl);
      if (!ttlValidation.success) {
        return {
          success: false,
          message: ttlValidation.message,
          data: false,
        };
      }

      const rawData = localStorage.getItem(this.getNamespacedKey(key));
      if (!rawData) {
        return {
          success: true,
          message: 'Item not found',
          data: false,
        };
      }

      let data = rawData;
      if (this.encryption) {
        data = this.encryption.decrypt(data);
      }

      if (this.compression) {
        data = await this.compression?.decompressData(data);
      }

      const item: GlancyItem<unknown> = JSON.parse(data);
      item.ttl = ttl || this.defaultTTL;
      item.timestamp = Date.now();

      let serializedData = JSON.stringify(item);

      if (this.compression) {
        serializedData = await this.compression.compressData(serializedData);
      }

      if (this.encryption) {
        serializedData = this.encryption.encrypt(serializedData);
      }

      localStorage.setItem(this.getNamespacedKey(key), serializedData);
      return {
        success: true,
        message: 'TTL updated successfully',
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error updating TTL',
        data: false,
      };
    }
  }

  /**
   * Gets the remaining TTL for an item in milliseconds
   * @param key The key of the item to check
   * @returns The remaining TTL in milliseconds or null if not found
   */
  public async getTTL(key: string): Promise<GlancyResponse<number | null>> {
    try {
      const keyValidation = validateStorageKey(key);
      if (!keyValidation.success) {
        return {
          success: false,
          message: keyValidation.message,
          data: null,
        };
      }

      const rawData = localStorage.getItem(this.getNamespacedKey(key));
      if (!rawData) {
        return {
          success: true,
          message: 'Item not found',
          data: null,
        };
      }

      let data = rawData;
      if (this.encryption) {
        data = this.encryption.decrypt(data);
      }

      if (this.compression) {
        data = await this.compression?.decompressData(data);
      }

      const item: GlancyItem<unknown> = JSON.parse(data);
      if (!item.ttl) {
        return {
          success: true,
          message: 'Item has no TTL',
          data: null,
        };
      }

      return {
        success: true,
        message: 'TTL retrieved successfully',
        data: item.ttl - (Date.now() - item.timestamp),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error getting TTL',
        data: null,
      };
    }
  }

  /**
   * Returns the total size of all items in the namespace in bytes
   * @returns The total size in bytes
   */
  public size(): GlancyResponse<number> {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.namespace)) {
          const value = localStorage.getItem(key);
          totalSize += key.length + (value?.length ?? 0);
        }
      }
      return {
        success: true,
        message: 'Size calculated successfully',
        data: totalSize,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Error calculating size',
        data: 0,
      };
    }
  }
}
