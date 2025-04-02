# API Reference

## Glancy Class

The main class that provides storage functionality with encryption and compression support.

### Constructor

```typescript
constructor(options?: GlancyOptions)
```

#### Options

| Option             | Type                              | Description                          |
| ------------------ | --------------------------------- | ------------------------------------ |
| `compress`         | boolean                           | Enable compression (default: false)  |
| `compressionLevel` | number                            | Compression level (1-9, default: 6)  |
| `encryption`       | { enabled: boolean, key: string } | Encryption configuration             |
| `defaultTTL`       | number                            | Default Time-To-Live in milliseconds |

### Methods

#### get<T>

Retrieves a value from storage.

```typescript
async get<T>(key: string): Promise<GlancyResponse<T>>
```

#### set<T>

Stores a value in storage.

```typescript
async set<T>(key: string, value: T, ttl?: number): Promise<GlancyResponse<void>>
```

#### getMany<T>

Retrieves multiple values at once.

```typescript
async getMany<T>(keys: string[]): Promise<GlancyResponse<Record<string, T | null>>>
```

#### setMany<T>

Stores multiple values at once.

```typescript
async setMany<T>(items: Record<string, T>, ttl?: number): Promise<GlancyResponse<void>>
```

#### remove

Removes a value from storage.

```typescript
remove(key: string): GlancyResponse<void>
```

#### clear

Removes all values from storage.

```typescript
clear(): GlancyResponse<void>
```

#### keys

Returns all keys in storage.

```typescript
keys(): GlancyResponse<string[]>
```

#### has

Checks if a key exists in storage.

```typescript
async has(key: string): Promise<GlancyResponse<boolean>>
```

#### touch

Updates the TTL of an existing item.

```typescript
async touch(key: string, ttl?: number): Promise<GlancyResponse<boolean>>
```

#### getTTL

Gets the remaining TTL of an item.

```typescript
async getTTL(key: string): Promise<GlancyResponse<number | null>>
```

#### size

Returns the number of items in storage.

```typescript
size(): GlancyResponse<number>
```

## Types

### GlancyResponse<T>

```typescript
interface GlancyResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
```

### GlancyItem<T>

```typescript
interface GlancyItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}
```

### GlancyOptions

```typescript
interface GlancyOptions {
  compress?: boolean;
  compressionLevel?: number;
  encryption?: {
    enabled: boolean;
    key: string;
  };
  defaultTTL?: number;
}
```
