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

import type { GlancyOptions, GlancyItem } from '../types';

import { LZWCompressor } from '../compression/LZWCompressor';
import { AESEncryption } from '../encryption/AESEncryption';
import { GlancyError } from '../utils/errors';
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
        dictionarySize: options.dictionarySize || 4096,
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
  public get<T>(key: string): T | null {
    try {
      validateStorageKey(key);

      const rawData = localStorage.getItem(this.getNamespacedKey(key));
      if (!rawData) return null;

      let data = rawData;
      if (this.encryption) {
        data = this.encryption.decrypt(data);
      }

      if (this.compression) {
        data = this.compression?.decompressData(data);
      }

      const item: GlancyItem<T> = JSON.parse(data);
      if (!item || typeof item.value === 'undefined') {
        this.handleError(`Invalid item for key ${key}`, null);
        return null;
      }

      if (this.isExpired(item)) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      this.handleError('Error getting item', error);
      return null;
    }
  }

  /**
   * Sets a value in storage with optional encryption and TTL
   * @param key The key to associate with the value
   * @param value The value to store
   * @param ttl Optional time-to-live for the item
   */
  public set<T>(key: string, value: T, ttl?: number): void {
    try {
      validateStorageKey(key);
      validateTTL(ttl);

      const item: GlancyItem<T> = {
        value: value === null || value === undefined ? null : value,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTTL,
        version: 1,
      };

      let serializedData = JSON.stringify(item);

      if (this.compression) {
        serializedData = this.compression.compressData(serializedData);
      }

      if (this.encryption) {
        serializedData = this.encryption.encrypt(serializedData);
      }

      try {
        localStorage.setItem(this.getNamespacedKey(key), serializedData);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'QuotaExceededError') {
            throw new GlancyError('Storage quota exceeded');
          } else {
            throw error;
          }
        }
        throw error;
      }
    } catch (error) {
      this.handleError('Error setting item', error);
    }
  }

  /**
   * Gets multiple items at once
   * @param keys An array of keys to retrieve
   * @returns An object mapping keys to their values or null if not found
   */
  public getMany<T>(keys: string[]): Record<string, T | null> {
    return keys.reduce(
      (acc, key) => {
        acc[key] = this.get<T>(key);
        return acc;
      },
      {} as Record<string, T | null>
    );
  }

  /**
   * Sets multiple items at once
   * @param items An object mapping keys to values
   * @param ttl Optional time-to-live for the items
   */
  public setMany<T>(items: Record<string, T>, ttl?: number): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
  }

  /**
   * Removes an item from storage
   * @param key The key of the item to remove
   */
  public remove(key: string): void {
    validateStorageKey(key);

    localStorage.removeItem(this.getNamespacedKey(key));
  }

  /**
   * Clears all items in the current namespace
   */
  public clear(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.namespace))
      .forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Gets all keys in the current namespace
   * @returns An array of keys in the current namespace
   */
  public keys(): string[] {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.namespace))
      .map((key) => key.replace(`${this.namespace}:`, ''));
  }

  /**
   * Checks if a key exists and is not expired
   * @param key The key to check
   * @returns True if the key exists and is not expired, otherwise false
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Updates the TTL for an existing item
   * @param key The key of the item to update
   * @param ttl Optional new time-to-live for the item
   * @returns True if the TTL was updated, otherwise false
   */
  public touch(key: string, ttl?: number): boolean {
    try {
      validateStorageKey(key);
      validateTTL(ttl);

      const rawData = localStorage.getItem(this.getNamespacedKey(key));
      if (!rawData) return false;

      let data = rawData;
      if (this.encryption) {
        data = this.encryption.decrypt(data);
      }

      if (this.compression) {
        data = this.compression?.decompressData(data);
      }

      const item: GlancyItem<unknown> = JSON.parse(data);
      item.ttl = ttl || this.defaultTTL;
      item.timestamp = Date.now();

      let serializedData = JSON.stringify(item);

      if (this.compression) {
        serializedData = this.compression.compressData(serializedData);
      }

      if (this.encryption) {
        serializedData = this.encryption.encrypt(serializedData);
      }

      localStorage.setItem(this.getNamespacedKey(key), serializedData);
      return true;
    } catch (error) {
      this.handleError('Error updating TTL', error);
      return false;
    }
  }

  /**
   * Gets the remaining TTL for an item in milliseconds
   * @param key The key of the item to check
   * @returns The remaining TTL in milliseconds or null if not found
   */
  public getTTL(key: string): number | null {
    try {
      validateStorageKey(key);

      const rawData = localStorage.getItem(this.getNamespacedKey(key));
      if (!rawData) return null;

      let data = rawData;
      if (this.encryption) {
        data = this.encryption.decrypt(data);
      }

      if (this.compression) {
        data = this.compression?.decompressData(data);
      }

      const item: GlancyItem<unknown> = JSON.parse(data);
      if (!item.ttl) return null;

      return item.ttl - (Date.now() - item.timestamp);
    } catch (error) {
      this.handleError('Error getting TTL', error);
      return null;
    }
  }

  /**
   * Returns the total size of all items in the namespace in bytes
   * @returns The total size in bytes
   */
  public size(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.namespace)) {
        const value = localStorage.getItem(key);
        totalSize += key.length + (value?.length ?? 0);
      }
    }
    return totalSize;
  }

  protected getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  protected isExpired(item: GlancyItem<unknown>): boolean {
    if (!item.ttl) return false;
    return Date.now() > item.timestamp + item.ttl;
  }

  private handleError(message: string, error: unknown): void {
    if (error instanceof GlancyError) {
      throw new GlancyError(`${message}: ${error.message}`);
    }
    throw new GlancyError(message);
  }
}
