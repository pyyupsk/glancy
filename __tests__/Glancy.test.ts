import { Glancy } from '../dist';

describe('Glancy Storage Library', () => {
  let storage: Glancy;

  beforeEach(() => {
    localStorage.clear();
    storage = new Glancy();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Basic Storage Operations', () => {
    test('should store and retrieve primitive values', async () => {
      await storage.set('string', 'hello');
      await storage.set('number', 42);
      await storage.set('boolean', true);

      const stringResult = await storage.get('string');
      const numberResult = await storage.get('number');
      const booleanResult = await storage.get('boolean');

      expect(stringResult.success).toBe(true);
      expect(stringResult.data).toBe('hello');
      expect(numberResult.success).toBe(true);
      expect(numberResult.data).toBe(42);
      expect(booleanResult.success).toBe(true);
      expect(booleanResult.data).toBe(true);
    });

    test('should store and retrieve complex objects', async () => {
      const testObj = {
        name: 'Test',
        nested: { value: 123 },
        array: [1, 2, 3],
      };

      await storage.set('object', testObj);
      const result = await storage.get('object');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testObj);
    });

    test('should return null for non-existent keys', async () => {
      const result = await storage.get('nonexistent');
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('Namespace Handling', () => {
    test('should use custom namespace', async () => {
      const customStorage = new Glancy({ namespace: 'custom' });
      await customStorage.set('key', 'value');

      expect(localStorage.getItem('custom:key')).toBeTruthy();
      expect(localStorage.getItem('glancy:key')).toBeNull();
    });

    test('should not conflict between different namespaces', async () => {
      const storage1 = new Glancy({ namespace: 'ns1' });
      const storage2 = new Glancy({ namespace: 'ns2' });

      await storage1.set('key', 'value1');
      await storage2.set('key', 'value2');

      const result1 = await storage1.get('key');
      const result2 = await storage2.get('key');

      expect(result1.success).toBe(true);
      expect(result1.data).toBe('value1');
      expect(result2.success).toBe(true);
      expect(result2.data).toBe('value2');
    });
  });

  describe('TTL Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should expire items after TTL', async () => {
      await storage.set('expiring', 'value', 1000);

      const initialResult = await storage.get('expiring');
      expect(initialResult.success).toBe(true);
      expect(initialResult.data).toBe('value');

      vi.advanceTimersByTime(1100);

      const expiredResult = await storage.get('expiring');
      expect(expiredResult.success).toBe(true);
      expect(expiredResult.data).toBeNull();
    });

    test('should handle default TTL', async () => {
      storage = new Glancy({ defaultTTL: 1000 });
      await storage.set('defaultExpiring', 'value');

      const initialResult = await storage.get('defaultExpiring');
      expect(initialResult.success).toBe(true);
      expect(initialResult.data).toBe('value');

      vi.advanceTimersByTime(1100);

      const expiredResult = await storage.get('defaultExpiring');
      expect(expiredResult.success).toBe(true);
      expect(expiredResult.data).toBeNull();
    });

    test('should update TTL with touch', async () => {
      await storage.set('touching', 'value', 1000);

      vi.advanceTimersByTime(500);
      const touchResult = await storage.touch('touching', 1000);
      expect(touchResult.success).toBe(true);
      expect(touchResult.data).toBe(true);

      vi.advanceTimersByTime(700);
      const afterTouchResult = await storage.get('touching');
      expect(afterTouchResult.success).toBe(true);
      expect(afterTouchResult.data).toBe('value');

      vi.advanceTimersByTime(400);
      const expiredResult = await storage.get('touching');
      expect(expiredResult.success).toBe(true);
      expect(expiredResult.data).toBeNull();
    });
  });

  describe('Encryption', () => {
    const encryptionKey = 'test-encryption-key';

    beforeEach(() => {
      storage = new Glancy({
        encryption: { enabled: true, key: encryptionKey },
      });
    });

    test('should encrypt stored data', async () => {
      await storage.set('secret', 'sensitive-data');
      const rawData = localStorage.getItem('glancy:secret');

      expect(rawData).not.toContain('sensitive-data');
      const result = await storage.get('secret');
      expect(result.success).toBe(true);
      expect(result.data).toBe('sensitive-data');
    });

    test('should handle encryption with complex objects', async () => {
      const secretObj = {
        password: 'secret123',
        tokens: ['token1', 'token2'],
      };

      await storage.set('secrets', secretObj);
      const rawData = localStorage.getItem('glancy:secrets');

      expect(rawData).not.toContain('secret123');
      const result = await storage.get('secrets');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(secretObj);
    });
  });

  describe('Compression', () => {
    beforeEach(() => {
      storage = new Glancy({ compress: true });
    });

    test('should compress large strings', async () => {
      const largeString = 'a'.repeat(4 * 1024 * 1024);
      await storage.set('large', largeString);

      const rawData = localStorage.getItem('glancy:large');
      expect(rawData!.length).toBeLessThan(largeString.length);
      const result = await storage.get('large');
      expect(result.success).toBe(true);
      expect(result.data).toBe(largeString);
    });

    test('should handle compression with repeated patterns', async () => {
      const repeatedPattern = 'hello world '.repeat(100);
      await storage.set('patterns', repeatedPattern);

      const rawData = localStorage.getItem('glancy:patterns');
      expect(rawData!.length).toBeLessThan(repeatedPattern.length);
      const result = await storage.get('patterns');
      expect(result.success).toBe(true);
      expect(result.data).toBe(repeatedPattern);
    });
  });

  describe('Bulk Operations', () => {
    test('should handle getMany operation', async () => {
      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');

      const result = await storage.getMany(['key1', 'key2', 'nonexistent']);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        key1: 'value1',
        key2: 'value2',
        nonexistent: null,
      });
    });

    test('should handle setMany operation', async () => {
      await storage.setMany({
        bulk1: 'value1',
        bulk2: 'value2',
      });

      const result1 = await storage.get('bulk1');
      const result2 = await storage.get('bulk2');

      expect(result1.success).toBe(true);
      expect(result1.data).toBe('value1');
      expect(result2.success).toBe(true);
      expect(result2.data).toBe('value2');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid keys', async () => {
      const result = await storage.set('', 'value');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid storage key');
      expect(result.data).toBeUndefined();
    });

    test('should handle invalid TTL values', async () => {
      const result = await storage.set('key', 'value', -1);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid TTL value');
      expect(result.data).toBeUndefined();
    });

    test('should handle storage quota exceeded', async () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      });

      const result = await storage.set('quota', 'x'.repeat(6 * 1024 * 1024));
      expect(result.success).toBe(false);
      expect(result.message).toBe('Storage quota exceeded');
      expect(result.data).toBeUndefined();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('Storage Information', () => {
    test('should calculate correct storage size', async () => {
      await storage.set('size1', 'a'.repeat(10000));
      await storage.set('size2', 'b'.repeat(20000));

      const result = storage.size();
      expect(result.success).toBe(true);
      expect(result.data).toBeGreaterThan(0);
    });

    test('should return correct TTL information', async () => {
      await storage.set('ttl-test', 'value', 5000);

      const result = await storage.getTTL('ttl-test');
      expect(result.success).toBe(true);
      expect(result.data).toBeLessThanOrEqual(5000);
      expect(result.data).toBeGreaterThan(0);
    });
  });
});
