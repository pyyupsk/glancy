# Glancy Storage Library

Glancy is a powerful, flexible, and efficient client-side storage library for modern JavaScript applications. It provides a range of features including key-value storage, item expiration (TTL), encryption, compression, and the ability to handle multiple items at once. This project is designed to be simple to use, while also providing advanced features for complex storage needs.

## Features

- **Namespace Support**: All items are stored under a unique namespace.
- **Time-to-Live (TTL)**: You can set an expiration time for stored items.
- **Compression**: Supports LZW compression for optimizing storage space.
- **Encryption**: AES encryption for secure storage of sensitive data.
- **Error Handling**: Graceful error handling with custom error classes.
- **Batch Operations**: Methods to get/set multiple items in a single operation.
- **Storage Integrity**: Validations and checks to ensure safe storage usage.

## Usage

Before using Glancy, you need to install the package:

```bash
npm install glancy
```

Then, you can import the Glancy class:

```typescript
import { Glancy } from 'glancy';

const storage = new Glancy({ namespace: 'my_app' });
```

### Basic Storage Operations

You can use the Glancy storage to set, get, and remove items easily.

```typescript
import { Glancy } from 'glancy';

const storage = new Glancy({ namespace: 'my_app' });

// Set a value
storage.set('my_key', { value: 'Hello, world!' }, 60000); // TTL of 1 minute

// Get a value
const data = storage.get<{ value: string }>('my_key');
console.log(data?.value); // Outputs: Hello, world!

// Remove a value
storage.remove('my_key');

// Clear all items in the namespace
storage.clear();
```

### Compression and Encryption

Glancy supports compression and encryption to optimize storage space and secure your data.

```typescript
const storage = new Glancy({
  namespace: 'my_app',
  encrypt: true, // Enable encryption
  compress: true, // Enable compression
  encryptionKey: 'my-secret-key', // Encryption key
});

// Set a value with compression and encryption
storage.set('secure_key', { value: 'Sensitive Information' }, 60000);

// Get the encrypted and compressed value
const result = storage.get<{ value: string }>('secure_key');
console.log(result?.value); // Outputs: Sensitive Information
```

### Batch Operations

Glancy allows you to perform operations on multiple keys at once:

```typescript
// Setting multiple items
storage.setMany({
  key1: { value: 'value1' },
  key2: { value: 'value2' },
});

// Getting multiple items
const values = storage.getMany(['key1', 'key2']);
console.log(values['key1']); // Outputs: value1
```

### Expiration (TTL)

Items stored with Glancy can expire after a specified TTL. If the TTL expires, the item is automatically removed from storage.

```typescript
storage.set('temporary_data', { value: 'Expires Soon' }, 5000); // Expires in 5 seconds

setTimeout(() => {
  const data = storage.get('temporary_data');
  console.log(data); // Should be null after 5 seconds
}, 6000);
```

## API Reference

### Glancy Methods

#### `set(key: string, value: T, ttl?: number): void`

Sets a value in storage. You can optionally specify a TTL (time-to-live).

#### `get<T>(key: string): T | null`

Gets a value from storage. Returns `null` if the key does not exist or has expired.

#### `remove(key: string): void`

Removes an item from storage.

#### `clear(): void`

Clears all items within the current namespace.

#### `keys(): string[]`

Returns an array of keys within the current namespace.

#### `has(key: string): boolean`

Checks if a key exists and is not expired.

#### `touch(key: string, ttl?: number): boolean`

Updates the TTL for an existing item.

#### `getTTL(key: string): number | null`

Gets the remaining TTL for a given key.

#### `size(): number`

Returns the total size (in bytes) of all items in the namespace.

## Contributing

We welcome contributions! If you'd like to contribute to Glancy, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -am 'feat: add new feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Create a new Pull Request

## License

Glancy is licensed under the xxx License. See the [LICENSE](LICENSE) file for details.

---

> [!NOTE]
> This project is still actively maintained. For any issues or feature requests, feel free to open an issue or submit a pull request.
