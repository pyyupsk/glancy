# Getting Started

## Installation

You can install Glancy using your preferred package manager:

```bash
# Using npm
npm install glancy

# Using yarn
yarn add glancy

# Using pnpm
pnpm add glancy
```

## Basic Usage

Here's a simple example of how to use Glancy:

```typescript
import { Glancy } from 'glancy';

// Create a new Glancy instance
const storage = new Glancy();

// Store a value
await storage.set('user', { name: 'John', age: 30 });

// Retrieve the value
const result = await storage.get('user');
if (result.success) {
  console.log(result.data); // { name: 'John', age: 30 }
}
```

## Features

Glancy comes with several powerful features:

- **Encryption**: Secure your data with AES encryption
- **Compression**: Reduce storage space with LZW compression
- **TTL Support**: Set expiration times for your data
- **Batch Operations**: Perform multiple operations at once
- **Type Safety**: Full TypeScript support

## Configuration

You can configure Glancy with various options:

```typescript
const storage = new Glancy({
  // Enable compression
  compress: true,
  compressionLevel: 6,

  // Enable encryption
  encryption: {
    enabled: true,
    key: 'your-secret-key',
  },

  // Set default TTL (in milliseconds)
  defaultTTL: 3600000, // 1 hour
});
```

## Next Steps

- Check out the [API Reference](/api/) for detailed documentation
- Learn about [Advanced Usage](/guide/advanced) for more complex scenarios
- See [Examples](/examples/) for real-world use cases
