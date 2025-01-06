import { Glancy } from '../src/storage/Glancy';
import { GlancyError } from '../src/utils/errors';

describe('Glancy', () => {
  let storage: Glancy;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new Glancy({ namespace: 'test_storage' });
  });

  test('should set and get an item', () => {
    storage.set('key1', { value: 'testValue' }, 1000);
    const result = storage.get<{ value: string }>('key1');
    expect(result?.value).toEqual('testValue');
  });

  test('should return null for non-existing item', () => {
    const result = storage.get('nonExistingKey');
    expect(result).toBeNull();
  });

  test('should remove an item', () => {
    storage.set('key2', { value: 'testValue' }, 1000);
    storage.remove('key2');
    const result = storage.get('key2');
    expect(result).toBeNull();
  });

  test('should handle expired items', () => {
    storage.set(
      'key3',
      { value: 'testValue', timestamp: Date.now(), ttl: 1 },
      1
    );
    // Wait for the item to expire
    setTimeout(() => {
      const result = storage.get('key3');
      expect(result).toBeNull();
    }, 10);
  });

  test('should throw error for invalid key', () => {
    expect(() => storage.set('', 'value')).toThrow(GlancyError);
  });

  test('should return keys in the namespace', () => {
    storage.set('key4', { value: 'testValue' });
    const keys = storage.keys();
    expect(keys).toContain('key4');
  });

  test('should clear all items in the namespace', () => {
    storage.set('key5', { value: 'testValue' });
    storage.clear();
    const result = storage.get('key5');
    expect(result).toBeNull();
  });

  test('should handle special characters in keys', () => {
    const specialKey = 'key@#%&*';
    storage.set(specialKey, { value: 'specialValue' });
    const result = storage.get<{ value: string }>(specialKey);
    expect(result?.value).toEqual('specialValue');
  });

  test('should handle large data sizes', () => {
    const largeValue = 'x'.repeat(10000); // 10,000 characters
    storage.set('largeKey', { value: largeValue });
    const result = storage.get<{ value: string }>('largeKey');
    expect(result?.value).toEqual(largeValue);
  });

  test('should compress and encrypt data', () => {
    const value = { value: 'testValue' };
    storage.set('keyCompressEncrypt', value, 1000);
    const result = storage.get<{ value: string }>('keyCompressEncrypt');
    expect(result?.value).toEqual('testValue');
  });
});
