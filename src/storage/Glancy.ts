import { BaseStorage } from './BaseStorage';
import { GlancyOptions, GlancyItem } from '../types';
import { LZWCompressor } from '../compression/LZWCompressor';
import { AESEncryption } from '../encryption/AESEncryption';
import { validateStorageKey, validateTTL } from '../utils/validators';
import { GlancyError } from '../utils/errors';

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

    if (options.encryptionKey) {
      this.encryption = new AESEncryption({
        key: options.encryptionKey,
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
        throw new GlancyError('Invalid item structure');
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
        value,
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

      localStorage.setItem(this.getNamespacedKey(key), serializedData);
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
    const item = this.get(key);
    if (item === null) return false;
    this.set(key, item, ttl);
    return true;
  }

  /**
   * Gets the remaining TTL for an item in milliseconds
   * @param key The key of the item to check
   * @returns The remaining TTL in milliseconds or null if not found
   */
  public getTTL(key: string): number | null {
    try {
      const rawData = localStorage.getItem(this.getNamespacedKey(key));
      if (!rawData) return null;

      let data = rawData;
      if (this.encryption) {
        data = this.encryption.decrypt(data);
      }

      const item: GlancyItem<unknown> = JSON.parse(data);
      if (!item.ttl) return null;

      const remaining = item.timestamp + item.ttl - Date.now();
      return remaining > 0 ? remaining : null;
    } catch {
      return null;
    }
  }

  /**
   * Returns the total size of all items in the namespace in bytes
   * @returns The total size in bytes
   */
  public size(): number {
    return this.keys().reduce((size, key) => {
      const item = localStorage.getItem(this.getNamespacedKey(key));
      return size + (item ? item.length * 2 : 0); // UTF-16 uses 2 bytes per character
    }, 0);
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
