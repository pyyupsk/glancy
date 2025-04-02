# Glancy Class

The `Glancy` class is the main entry point for using the library. It provides a comprehensive API for storing, retrieving, and managing data with support for encryption and compression.

## Constructor

```typescript
constructor(options?: GlancyOptions)
```

Creates a new instance of the Glancy storage system.

### Parameters

- `options` (optional): Configuration options for the storage system
  - `compress`: Enable compression (default: false)
  - `compressionLevel`: Compression level (1-9, default: 6)
  - `encryption`: Encryption configuration
    - `enabled`: Enable encryption (default: false)
    - `key`: Encryption key
  - `defaultTTL`: Default Time-To-Live in milliseconds

### Example

```typescript
import { Glancy } from 'glancy';

// Basic usage
const storage = new Glancy();

// With compression
const compressedStorage = new Glancy({
  compress: true,
  compressionLevel: 9,
});

// With encryption
const encryptedStorage = new Glancy({
  encryption: {
    enabled: true,
    key: 'your-secret-key',
  },
});

// With TTL
const ttlStorage = new Glancy({
  defaultTTL: 3600000, // 1 hour
});
```

## Methods

### get<T>

Retrieves a value from storage.

```typescript
async get<T>(key: string): Promise<GlancyResponse<T>>
```

#### Parameters

- `key`: The key of the item to retrieve

#### Returns

A promise that resolves to a `GlancyResponse` containing the retrieved value or null if not found.

#### Example

```typescript
const result = await storage.get('user');
if (result.success) {
  console.log(result.data);
}
```

### set<T>

Stores a value in storage.

```typescript
async set<T>(key: string, value: T, ttl?: number): Promise<GlancyResponse<void>>
```

#### Parameters

- `key`: The key to associate with the value
- `value`: The value to store
- `ttl` (optional): Time-To-Live in milliseconds

#### Returns

A promise that resolves to a `GlancyResponse` indicating success or failure.

#### Example

```typescript
await storage.set('user', { name: 'John', age: 30 });
await storage.set('temporary', data, 1800000); // 30 minutes TTL
```

### getMany<T>

Retrieves multiple values at once.

```typescript
async getMany<T>(keys: string[]): Promise<GlancyResponse<Record<string, T | null>>>
```

#### Parameters

- `keys`: Array of keys to retrieve

#### Returns

A promise that resolves to a `GlancyResponse` containing an object mapping keys to their values or null if not found.

#### Example

```typescript
const results = await storage.getMany(['user', 'settings', 'preferences']);
if (results.success) {
  console.log(results.data.user);
  console.log(results.data.settings);
  console.log(results.data.preferences);
}
```

### setMany<T>

Stores multiple values at once.

```typescript
async setMany<T>(items: Record<string, T>, ttl?: number): Promise<GlancyResponse<void>>
```

#### Parameters

- `items`: Object mapping keys to values
- `ttl` (optional): Time-To-Live in milliseconds for all items

#### Returns

A promise that resolves to a `GlancyResponse` indicating success or failure.

#### Example

```typescript
await storage.setMany({
  user: { name: 'John' },
  settings: { theme: 'dark' },
  preferences: { language: 'en' },
});
```

### remove

Removes a value from storage.

```typescript
remove(key: string): GlancyResponse<void>
```

#### Parameters

- `key`: The key of the item to remove

#### Returns

A `GlancyResponse` indicating success or failure.

#### Example

```typescript
const result = storage.remove('user');
if (result.success) {
  console.log('User removed successfully');
}
```

### clear

Removes all values from storage.

```typescript
clear(): GlancyResponse<void>
```

#### Returns

A `GlancyResponse` indicating success or failure.

#### Example

```typescript
const result = storage.clear();
if (result.success) {
  console.log('All data cleared');
}
```

### keys

Returns all keys in storage.

```typescript
keys(): GlancyResponse<string[]>
```

#### Returns

A `GlancyResponse` containing an array of all keys in storage.

#### Example

```typescript
const result = storage.keys();
if (result.success) {
  console.log('Available keys:', result.data);
}
```

### has

Checks if a key exists in storage.

```typescript
async has(key: string): Promise<GlancyResponse<boolean>>
```

#### Parameters

- `key`: The key to check

#### Returns

A promise that resolves to a `GlancyResponse` containing a boolean indicating whether the key exists.

#### Example

```typescript
const result = await storage.has('user');
if (result.success && result.data) {
  console.log('User exists');
}
```

### touch

Updates the TTL of an existing item.

```typescript
async touch(key: string, ttl?: number): Promise<GlancyResponse<boolean>>
```

#### Parameters

- `key`: The key of the item to update
- `ttl` (optional): New Time-To-Live in milliseconds

#### Returns

A promise that resolves to a `GlancyResponse` containing a boolean indicating success.

#### Example

```typescript
const result = await storage.touch('user', 3600000); // Extend to 1 hour
if (result.success && result.data) {
  console.log('TTL updated successfully');
}
```

### getTTL

Gets the remaining TTL of an item.

```typescript
async getTTL(key: string): Promise<GlancyResponse<number | null>>
```

#### Parameters

- `key`: The key of the item to check

#### Returns

A promise that resolves to a `GlancyResponse` containing the remaining TTL in milliseconds or null if the item doesn't exist or has no TTL.

#### Example

```typescript
const result = await storage.getTTL('user');
if (result.success && result.data !== null) {
  console.log(`Item expires in ${result.data}ms`);
}
```

### size

Returns the number of items in storage.

```typescript
size(): GlancyResponse<number>
```

#### Returns

A `GlancyResponse` containing the number of items in storage.

#### Example

```typescript
const result = storage.size();
if (result.success) {
  console.log(`Storage contains ${result.data} items`);
}
```
