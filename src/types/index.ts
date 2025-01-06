import { CompressionMeta } from '../compression/types';

export interface GlancyOptions {
  namespace?: string;
  encryptionKey?: string;
  defaultTTL?: number;
  compress?: boolean;
  dictionarySize?: number;
}

export interface GlancyItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  version?: number;
  compressionMeta?: CompressionMeta;
}

export interface IStorage {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  remove(key: string): void;
  clear(): void;
}
