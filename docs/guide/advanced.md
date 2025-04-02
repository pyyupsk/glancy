# Advanced Usage

## Encryption

Glancy provides built-in encryption using AES. Here's how to use it:

```typescript
import { Glancy } from 'glancy';

const storage = new Glancy({
  encryption: {
    enabled: true,
    key: 'your-secure-key-here',
  },
});

// Store encrypted data
await storage.set('secret', { password: '123456' });

// Retrieve and automatically decrypt
const result = await storage.get('secret');
```

## Compression

Enable compression to reduce storage space:

```typescript
const storage = new Glancy({
  compress: true,
  compressionLevel: 9, // Maximum compression
});

// Store compressed data
await storage.set('largeData', largeObject);

// Retrieve and automatically decompress
const result = await storage.get('largeData');
```

## TTL (Time-To-Live)

Manage data expiration:

```typescript
const storage = new Glancy({
  defaultTTL: 3600000, // 1 hour default
});

// Store with custom TTL
await storage.set('temporary', data, 1800000); // 30 minutes

// Check remaining TTL
const ttlResult = await storage.getTTL('temporary');
if (ttlResult.success && ttlResult.data) {
  console.log(`Item expires in ${ttlResult.data}ms`);
}

// Extend TTL
await storage.touch('temporary', 3600000); // Extend to 1 hour
```

## Batch Operations

Perform multiple operations efficiently:

```typescript
// Store multiple items
await storage.setMany({
  user: { name: 'John' },
  settings: { theme: 'dark' },
  preferences: { language: 'en' },
});

// Retrieve multiple items
const results = await storage.getMany(['user', 'settings', 'preferences']);
```

## Error Handling

Glancy provides consistent error handling through the `GlancyResponse` type:

```typescript
const result = await storage.get('nonexistent');
if (!result.success) {
  console.error(`Error: ${result.message}`);
  return;
}

// Type-safe access to data
const data = result.data;
```

## Storage Quota Management

Handle storage quota exceeded errors:

```typescript
try {
  await storage.set('largeData', veryLargeObject);
} catch (error) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    // Handle quota exceeded
    console.error('Storage quota exceeded');
  }
}
```

## Best Practices

1. **Key Naming**

   - Use consistent naming conventions
   - Avoid special characters
   - Use namespaces for different data types

2. **TTL Management**

   - Set appropriate TTL values based on data freshness requirements
   - Use `touch()` to extend TTL when needed
   - Monitor TTL expiration

3. **Encryption**

   - Keep encryption keys secure
   - Rotate keys periodically
   - Use strong keys

4. **Compression**

   - Enable compression for large objects
   - Adjust compression level based on performance needs
   - Monitor compression ratio

5. **Error Handling**
   - Always check `success` property
   - Handle errors gracefully
   - Log errors for debugging
