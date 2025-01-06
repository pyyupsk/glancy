import type { IStorage, GlancyOptions, GlancyItem } from '../types';

export abstract class BaseStorage implements IStorage {
  protected readonly namespace: string;

  constructor(options: GlancyOptions = {}) {
    this.namespace =
      options.namespace || process.env.GLANCY_NAMESPACE || 'glancy';
  }

  abstract get<T>(key: string): T | null;
  abstract set<T>(key: string, value: T, ttl?: number): void;
  abstract remove(key: string): void;
  abstract clear(): void;

  protected getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  protected isExpired(item: GlancyItem<unknown>): boolean {
    if (!item.ttl) return false;
    return Date.now() > item.timestamp + item.ttl;
  }
}
