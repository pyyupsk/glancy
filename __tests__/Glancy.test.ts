import { Glancy } from '../src';
import { GlancyError } from '../src/utils/errors';

describe('Glancy Storage Library', () => {
  let storage: Glancy;

  beforeEach(() => {
    localStorage.clear();
    storage = new Glancy();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Basic Storage Operations', () => {
    test('should store and retrieve primitive values', () => {
      storage.set('string', 'hello');
      storage.set('number', 42);
      storage.set('boolean', true);

      expect(storage.get('string')).toBe('hello');
      expect(storage.get('number')).toBe(42);
      expect(storage.get('boolean')).toBe(true);
    });

    test('should store and retrieve complex objects', () => {
      const testObj = {
        name: 'Test',
        nested: { value: 123 },
        array: [1, 2, 3],
      };

      storage.set('object', testObj);
      expect(storage.get('object')).toEqual(testObj);
    });

    test('should handle undefined and null values', () => {
      storage.set('undefined', undefined);
      storage.set('null', null);

      expect(storage.get('undefined')).toBeNull();
      expect(storage.get('null')).toBeNull();
    });

    test('should return null for non-existent keys', () => {
      expect(storage.get('nonexistent')).toBeNull();
    });
  });

  describe('Namespace Handling', () => {
    test('should use custom namespace', () => {
      const customStorage = new Glancy({ namespace: 'custom' });
      customStorage.set('key', 'value');

      expect(localStorage.getItem('custom:key')).toBeTruthy();
      expect(localStorage.getItem('glancy:key')).toBeNull();
    });

    test('should not conflict between different namespaces', () => {
      const storage1 = new Glancy({ namespace: 'ns1' });
      const storage2 = new Glancy({ namespace: 'ns2' });

      storage1.set('key', 'value1');
      storage2.set('key', 'value2');

      expect(storage1.get('key')).toBe('value1');
      expect(storage2.get('key')).toBe('value2');
    });
  });

  describe('TTL Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers(); // Use fake timers to control time-based tests
    });

    afterEach(() => {
      jest.useRealTimers(); // Switch back to real timers after tests
    });

    test('should expire items after TTL', () => {
      storage.set('expiring', 'value', 1000); // 1 second TTL

      expect(storage.get('expiring')).toBe('value');

      jest.advanceTimersByTime(1100); // Advance time to simulate expiration
      expect(storage.get('expiring')).toBeNull();
    });

    test('should handle default TTL', () => {
      storage = new Glancy({ defaultTTL: 1000 });
      storage.set('defaultExpiring', 'value');

      expect(storage.get('defaultExpiring')).toBe('value');

      jest.advanceTimersByTime(1100); // Simulate TTL expiration
      expect(storage.get('defaultExpiring')).toBeNull();
    });

    test('should update TTL with touch', () => {
      storage.set('touching', 'value', 1000);

      jest.advanceTimersByTime(500); // Simulate partial TTL passing
      storage.touch('touching', 1000);

      jest.advanceTimersByTime(700); // Simulate time after touch
      expect(storage.get('touching')).toBe('value');

      jest.advanceTimersByTime(400); // Simulate TTL expiration
      expect(storage.get('touching')).toBeNull();
    });
  });

  describe('Encryption', () => {
    const encryptionKey = 'test-encryption-key';

    beforeEach(() => {
      storage = new Glancy({ encryptionKey });
    });

    test('should encrypt stored data', () => {
      storage.set('secret', 'sensitive-data');
      const rawData = localStorage.getItem('glancy:secret');

      expect(rawData).not.toContain('sensitive-data');
      expect(storage.get('secret')).toBe('sensitive-data');
    });

    test('should handle encryption with complex objects', () => {
      const secretObj = {
        password: 'secret123',
        tokens: ['token1', 'token2'],
      };

      storage.set('secrets', secretObj);
      const rawData = localStorage.getItem('glancy:secrets');

      expect(rawData).not.toContain('secret123');
      expect(storage.get('secrets')).toEqual(secretObj);
    });
  });

  describe('Compression', () => {
    beforeEach(() => {
      storage = new Glancy({ compress: true });
    });

    test('should compress large strings', () => {
      // 5 MB
      const largeString = 'a'.repeat(5242880); // 5MB
      storage.set('large', largeString);

      const rawData = localStorage.getItem('glancy:large');
      expect(rawData!.length).toBeLessThan(largeString.length);
      expect(storage.get('large')).toBe(largeString);
    });

    test('should handle compression with repeated patterns', () => {
      const repeatedPattern = 'hello world '.repeat(100);
      storage.set('patterns', repeatedPattern);

      const rawData = localStorage.getItem('glancy:patterns');
      expect(rawData!.length).toBeLessThan(repeatedPattern.length);
      expect(storage.get('patterns')).toBe(repeatedPattern);
    });
  });

  describe('Bulk Operations', () => {
    test('should handle getMany operation', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');

      const results = storage.getMany(['key1', 'key2', 'nonexistent']);
      expect(results).toEqual({
        key1: 'value1',
        key2: 'value2',
        nonexistent: null,
      });
    });

    test('should handle setMany operation', () => {
      storage.setMany({
        bulk1: 'value1',
        bulk2: 'value2',
      });

      expect(storage.get('bulk1')).toBe('value1');
      expect(storage.get('bulk2')).toBe('value2');
    });
  });

  describe('Error Handling', () => {
    test('should throw on invalid keys', () => {
      expect(() => storage.set('', 'value')).toThrow(GlancyError);
      // @ts-expect-error Testing invalid key
      expect(() => storage.set(123, 'value')).toThrow(GlancyError);
    });

    test('should throw on invalid TTL values', () => {
      expect(() => storage.set('key', 'value', -1)).toThrow(GlancyError);
      expect(() => storage.set('key', 'value', 1.5)).toThrow(GlancyError);
    });

    test('should handle storage quota exceeded', () => {
      // Mock quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => storage.set('quota', 'x'.repeat(6291456))).toThrow(); // 6MB limit of 5 MB (megabytes) per domain.

      localStorage.setItem = originalSetItem;
    });
  });

  describe('Storage Information', () => {
    test('should calculate correct storage size', () => {
      storage.set('size1', 'a'.repeat(10000));
      storage.set('size2', 'b'.repeat(20000));

      const size = storage.size();
      expect(size).toBeGreaterThan(0);
    });

    test('should return correct TTL information', () => {
      storage.set('ttl-test', 'value', 5000);

      const remainingTTL = storage.getTTL('ttl-test');
      expect(remainingTTL).toBeLessThanOrEqual(5000);
      expect(remainingTTL).toBeGreaterThan(0);
    });
  });
});
