import { GlancyError } from './errors';

export function validateStorageKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new GlancyError('Invalid storage key');
  }
}

export function validateTTL(ttl?: number): void {
  if (ttl !== undefined && (!Number.isInteger(ttl) || ttl < 0)) {
    throw new GlancyError('Invalid TTL value');
  }
}
