# Types

Glancy uses TypeScript to provide type safety and better developer experience. This page documents all the types used in the library.

## GlancyResponse<T>

A generic response type used by all Glancy methods to provide consistent error handling and type safety.

```typescript
interface GlancyResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
```

### Properties

- `success`: A boolean indicating whether the operation was successful
- `message`: A string describing the result of the operation
- `data`: The actual data returned by the operation, or null if the operation failed

### Example

```typescript
// Successful operation
const successResponse: GlancyResponse<User> = {
  success: true,
  message: 'User retrieved successfully',
  data: { id: 1, name: 'John' },
};

// Failed operation
const failureResponse: GlancyResponse<User> = {
  success: false,
  message: 'User not found',
  data: null,
};
```

## GlancyItem<T>

The internal representation of an item stored in Glancy.

```typescript
interface GlancyItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}
```

### Properties

- `value`: The actual value being stored
- `timestamp`: The timestamp when the item was stored (in milliseconds)
- `ttl` (optional): The Time-To-Live in milliseconds

### Example

```typescript
const item: GlancyItem<User> = {
  value: { id: 1, name: 'John' },
  timestamp: Date.now(),
  ttl: 3600000, // 1 hour
};
```

## GlancyOptions

Configuration options for the Glancy constructor.

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

### Properties

- `compress` (optional): Enable compression (default: false)
- `compressionLevel` (optional): Compression level (1-9, default: 6)
- `encryption` (optional): Encryption configuration
  - `enabled`: Enable encryption (default: false)
  - `key`: Encryption key
- `defaultTTL` (optional): Default Time-To-Live in milliseconds

### Example

```typescript
const options: GlancyOptions = {
  compress: true,
  compressionLevel: 9,
  encryption: {
    enabled: true,
    key: 'your-secret-key',
  },
  defaultTTL: 3600000, // 1 hour
};

const storage = new Glancy(options);
```

## Type Constraints

Glancy can store any serializable data type. However, there are some constraints to keep in mind:

1. **Circular References**: Objects with circular references cannot be stored
2. **Functions**: Functions cannot be stored
3. **Symbols**: Symbols cannot be stored
4. **BigInt**: BigInt values cannot be stored

### Example of Valid Types

```typescript
// Primitive types
await storage.set('string', 'Hello');
await storage.set('number', 42);
await storage.set('boolean', true);
await storage.set('null', null);
await storage.set('undefined', undefined);

// Arrays
await storage.set('array', [1, 2, 3]);
await storage.set('objectArray', [{ id: 1 }, { id: 2 }]);

// Objects
await storage.set('object', { name: 'John', age: 30 });
await storage.set('nestedObject', {
  user: {
    profile: {
      name: 'John',
    },
  },
});

// Dates
await storage.set('date', new Date());

// Maps and Sets (will be converted to objects and arrays)
await storage.set('map', new Map([['key', 'value']]));
await storage.set('set', new Set([1, 2, 3]));
```

### Example of Invalid Types

```typescript
// Circular reference
const obj: any = {};
obj.self = obj;
await storage.set('circular', obj); // Will throw error

// Function
await storage.set('function', () => {}); // Will throw error

// Symbol
await storage.set('symbol', Symbol('test')); // Will throw error

// BigInt
await storage.set('bigint', BigInt(9007199254740991)); // Will throw error
```
