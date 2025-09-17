# 🚀 Glancy Storage Library

> [!WARNING]
> **This repository has been archived as of September 2025.** This project is no longer actively maintained. While the code remains available for reference and forking, no further updates, bug fixes, or support will be provided. For production use, please consider alternative storage libraries or fork this repository for your own development.

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pyyupsk_glancy&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=pyyupsk_glancy)

**Glancy** is a powerful, flexible, and efficient client-side storage library for modern JavaScript applications. It provides a range of features including key-value storage, item expiration (TTL), encryption, compression, and the ability to handle multiple items at once. This project is designed to be simple to use while also providing advanced features for complex storage needs.

## ✨ Features

- 🗂️ **Namespace Support**: All items are stored under a unique namespace.
- ⏱️ **Time-to-Live (TTL)**: You can set an expiration time for stored items.
- 🗜️ **Compression**: Built-in gzip compression for optimizing storage space.
- 🔒 **Encryption**: AES-256-GCM encryption with PBKDF2 key derivation for secure storage of sensitive data.
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

interface MyData {
  value: string;
}

// 🔑 Set a value
await storage.set<MyData>('my_key', { value: 'Hello, world!' }, 60000); // TTL of 1 minute

// 🔍 Get a value
const { data } = await storage.get<MyData>('my_key');
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
  encryption: {
    enabled: true, // 🔒 Enable encryption
    key: 'my-secret-key',
  },
  compress: true, // 🗜️ Enable compression
  compressionLevel: 6, // Optional: Set compression level (0-9)
});

interface SecureData {
  value: string;
}

// 🔑 Set a value securely
await storage.set<SecureData>(
  'secure_key',
  { value: 'Sensitive Information' },
  60000
);

// 🔍 Retrieve the secure value
const { data } = await storage.get<SecureData>('secure_key');
console.log(data?.value); // Outputs: Sensitive Information
```

> 🔧 **Tip**: You can generate a secure key using `openssl` by running `openssl rand -base64 32`

### 🤹‍♂️ Batch Operations

Perform operations on multiple keys at once:

```typescript
interface MyData {
  value: string;
}

// 🔑 Set multiple items
await storage.setMany<MyData>({
  key1: { value: 'value1' },
  key2: { value: 'value2' },
});

// 🔍 Get multiple items
const { data } = await storage.getMany<MyData>(['key1', 'key2']);
console.log(data['key1']); // Outputs: value1
```

### ⏳ Expiration (TTL)

Store items with a lifespan:

```typescript
await storage.set('temporary_data', { value: 'Expires Soon' }, 5000); // Expires in 5 seconds

setTimeout(async () => {
  const data = await storage.get('temporary_data');
  console.log(data); // Should be null after 5 seconds
}, 6000);
```

## 📖 API Reference

### 📦 Class Options

| Option             | Description                                         | Default                       |
| ------------------ | --------------------------------------------------- | ----------------------------- |
| `namespace`        | A unique identifier for the storage namespace.      | `glancy`                      |
| `encryption`       | An object containing encryption configuration.      | `{ enabled: false, key: '' }` |
| `defaultTTL`       | The default TTL (in milliseconds) for stored items. | `null`                        |
| `compress`         | Whether to enable compression for stored items.     | `false`                       |
| `compressionLevel` | The gzip compression level (0-9).                   | `6`                           |

### ⚙️ Methods

#### `get<T>(key: string): Promise<GlancyResponse<T>>`

Retrieves a value. Returns `null` if the key doesn't exist or has expired.

#### `set(key: string, value: T, ttl?: number): Promise<GlancyResponse<void>>`

Stores a value with an optional TTL.

#### `getMany<T>(keys: string[]): Promise<GlancyResponse<Record<string, T | null>>>`

Retrieves multiple values at once.

#### `setMany<T>(values: Record<string, T>, ttl?: number): Promise<GlancyResponse<void>>`

Stores multiple values at once.

#### `remove(key: string): GlancyResponse<void>`

Deletes an item from storage.

#### `clear(): GlancyResponse<void>`

Removes all items in the current namespace.

#### `keys(): GlancyResponse<string[]>`

Lists all keys in the namespace.

#### `has(key: string): Promise<GlancyResponse<boolean>>`

Checks if a key exists and is not expired.

#### `touch(key: string, ttl?: number): Promise<GlancyResponse<boolean>>`

Updates the TTL for an existing item.

#### `getTTL(key: string): Promise<GlancyResponse<number | null>>`

Gets the remaining TTL for a key.

#### `size(): GlancyResponse<number>`

Calculates the total size (in bytes) of all items in the namespace.

### 📚 Types Reference

#### `GlancyResponse<T>`

Represents the response from a storage operation.

| Property  | Description                                     |
| --------- | ----------------------------------------------- |
| `success` | Indicates whether the operation was successful. |
| `message` | A message associated with the response.         |
| `data`    | The data returned by the operation.             |

```typescript
interface GlancyResponse<T> {
  success: boolean;
  message: string;
  data: T | null | undefined;
}
```

---

For more details, visit the [Glancy Storage Library Documentation](/docs/index.md).

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
