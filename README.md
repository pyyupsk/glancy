# 🚀 Glancy Storage Library

**Glancy** is a powerful, flexible, and efficient client-side storage library for modern JavaScript applications. It provides a range of features including key-value storage, item expiration (TTL), encryption, compression, and the ability to handle multiple items at once. This project is designed to be simple to use while also providing advanced features for complex storage needs.

## ✨ Features

- 🗂️ **Namespace Support**: All items are stored under a unique namespace.
- ⏱️ **Time-to-Live (TTL)**: You can set an expiration time for stored items.
- 🗜️ **Compression**: Supports LZW compression for optimizing storage space.
- 🔒 **Encryption**: AES encryption for secure storage of sensitive data.
- ⚠️ **Error Handling**: Graceful error handling with custom error classes.
- 📦 **Batch Operations**: Methods to get/set multiple items in a single operation.
- 🛡️ **Storage Integrity**: Validations and checks to ensure safe storage usage.

## 📦 Installation

Install the package via npm:

```bash
npm install glancy
```

Then, import the `Glancy` class:

```typescript
import { Glancy } from 'glancy';

const storage = new Glancy({ namespace: 'my_app' });
```

## 🛠️ Usage

### 🗝️ Basic Storage Operations

Easily set, get, and remove items:

```typescript
const storage = new Glancy({ namespace: 'my_app' });

// 🔑 Set a value
storage.set('my_key', { value: 'Hello, world!' }, 60000); // TTL of 1 minute

// 🔍 Get a value
const data = storage.get<{ value: string }>('my_key');
console.log(data?.value); // Outputs: Hello, world!

// 🗑️ Remove a value
storage.remove('my_key');

// 🧹 Clear all items in the namespace
storage.clear();
```

### 🔒 Compression and Encryption

Optimize storage and secure your data with built-in compression and encryption:

```typescript
const storage = new Glancy({
  namespace: 'my_app',
  encrypt: true, // 🔒 Enable encryption
  compress: true, // 🗜️ Enable compression
  encryptionKey: 'my-secret-key',
});

// Set a value securely
storage.set('secure_key', { value: 'Sensitive Information' }, 60000);

// Retrieve the secure value
const result = storage.get<{ value: string }>('secure_key');
console.log(result?.value); // Outputs: Sensitive Information
```

> 🔧 **Tip**: You can generate a secure key using `openssl` by running `openssl rand -base64 32`

### 🤹‍♂️ Batch Operations

Perform operations on multiple keys at once:

```typescript
// Set multiple items
storage.setMany({
  key1: { value: 'value1' },
  key2: { value: 'value2' },
});

// Get multiple items
const values = storage.getMany(['key1', 'key2']);
console.log(values['key1']); // Outputs: value1
```

### ⏳ Expiration (TTL)

Store items with a lifespan:

```typescript
storage.set('temporary_data', { value: 'Expires Soon' }, 5000); // Expires in 5 seconds

setTimeout(() => {
  const data = storage.get('temporary_data');
  console.log(data); // Should be null after 5 seconds
}, 6000);
```

## 📖 API Reference

### ⚙️ Glancy Methods

#### `get<T>(key: string): T | null`

Retrieves a value. Returns `null` if the key doesn’t exist or has expired.

#### `set(key: string, value: T, ttl?: number): void`

Stores a value with an optional TTL.

#### `getMany<T>(keys: string[]): Record<string, T | null>`

Retrieves multiple values at once.

#### `setMany<T>(values: Record<string, T>, ttl?: number): void`

Stores multiple values at once.

#### `remove(key: string): void`

Deletes an item from storage.

#### `clear(): void`

Removes all items in the current namespace.

#### `keys(): string[]`

Lists all keys in the namespace.

#### `has(key: string): boolean`

Checks if a key exists and is not expired.

#### `touch(key: string, ttl?: number): boolean`

Updates the TTL for an existing item.

#### `getTTL(key: string): number | null`

Gets the remaining TTL for a key.

#### `size(): number`

Calculates the total size (in bytes) of all items in the namespace.

---

For more details, visit the [Glancy Storage Library Wiki](https://github.com/pyyupsk/glancy/wiki/Glancy-Storage-Library-Wiki).

## 🤝 Contributing

We ❤️ contributions! Here's how to get started:

1. 🍴 Fork the repository
2. 🌱 Create a new branch (`git checkout -b feat/my-feature`)
3. 💻 Commit your changes (`git commit -am 'feat: add new feature'`)
4. 🚀 Push to your branch (`git push origin feat/my-feature`)
5. 🛠️ Create a Pull Request

## 📜 License

This project is licensed under the **[Apache 2.0 License](LICENSE)**.

> 🔧 **Pro Tip**: If you encounter any issues or have feature requests, feel free to open an issue or submit a pull request. Let's make Glancy even better!
