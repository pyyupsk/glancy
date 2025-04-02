# Compression Examples

Glancy provides data compression using the LZW algorithm to reduce storage space. Here are some examples of how to use compression in your applications.

## Basic Compression

```typescript
import { Glancy } from 'glancy';

// Create a storage instance with compression enabled
const storage = new Glancy({
  compress: true,
  compressionLevel: 6, // Default compression level
});

// Store compressed data
await storage.set('largeData', {
  items: Array(1000)
    .fill(0)
    .map((_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `This is a description for item ${i}`,
      tags: ['tag1', 'tag2', 'tag3'],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0.0',
      },
    })),
});

// Retrieve and automatically decompress
const result = await storage.get('largeData');
if (result.success) {
  console.log(`Retrieved ${result.data.items.length} items`);
}
```

## Compression Levels

You can adjust the compression level based on your needs:

```typescript
// Maximum compression (slower, but smaller size)
const maxCompression = new Glancy({
  compress: true,
  compressionLevel: 9,
});

// Minimum compression (faster, but larger size)
const minCompression = new Glancy({
  compress: true,
  compressionLevel: 1,
});

// Balanced compression (default)
const balancedCompression = new Glancy({
  compress: true,
  compressionLevel: 6,
});
```

## Large Dataset Example

Here's an example of compressing a large dataset:

```typescript
// Generate a large dataset
const generateLargeDataset = (size: number) => {
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push({
      id: i,
      name: `Item ${i}`,
      description: `This is a detailed description for item ${i} that contains a lot of text to demonstrate compression.`,
      category: ['Category A', 'Category B', 'Category C'][
        Math.floor(Math.random() * 3)
      ],
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'].slice(
        0,
        Math.floor(Math.random() * 5) + 1
      ),
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0.0',
        author: 'John Doe',
        status: ['active', 'inactive', 'pending'][
          Math.floor(Math.random() * 3)
        ],
      },
    });
  }
  return data;
};

// Create storage with compression
const storage = new Glancy({
  compress: true,
  compressionLevel: 9, // Maximum compression
});

// Store the large dataset
const largeDataset = generateLargeDataset(10000);
console.log('Original size:', JSON.stringify(largeDataset).length);

await storage.set('largeDataset', largeDataset);

// Retrieve the dataset
const result = await storage.get('largeDataset');
if (result.success) {
  console.log(`Retrieved ${result.data.length} items`);
}
```

## Combining Compression with Other Features

You can combine compression with encryption and TTL:

```typescript
// Create storage with compression and encryption
const storage = new Glancy({
  compress: true,
  compressionLevel: 6,
  encryption: {
    enabled: true,
    key: 'your-secure-key-here',
  },
  defaultTTL: 3600000, // 1 hour
});

// Store compressed and encrypted data
await storage.set('secureData', {
  // Large data object
  items: Array(1000)
    .fill(0)
    .map((_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `This is a description for item ${i}`,
      tags: ['tag1', 'tag2', 'tag3'],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0.0',
      },
    })),
});

// Retrieve, decompress, and decrypt
const result = await storage.get('secureData');
if (result.success) {
  console.log(`Retrieved ${result.data.items.length} items`);
}
```

## Performance Considerations

When using compression, consider these performance factors:

```typescript
// For small data, compression might not be worth it
const smallData = { name: 'John', age: 30 };
await storage.set('smallData', smallData); // Compression overhead might exceed benefits

// For large data, compression is highly beneficial
const largeData = {
  items: Array(10000)
    .fill(0)
    .map((_, i) => ({ id: i, name: `Item ${i}` })),
};
await storage.set('largeData', largeData); // Significant storage savings

// For frequently accessed data, consider lower compression levels
const frequentAccess = new Glancy({
  compress: true,
  compressionLevel: 3, // Lower compression for faster decompression
});

// For rarely accessed data, use higher compression levels
const archiveData = new Glancy({
  compress: true,
  compressionLevel: 9, // Maximum compression for storage efficiency
});
```

## Compression Best Practices

1. **Use for Large Data**: Compression is most beneficial for large data objects
2. **Adjust Compression Level**: Balance between compression ratio and performance
3. **Consider Access Patterns**: Use lower compression for frequently accessed data
4. **Monitor Performance**: Measure the impact of compression on your application
5. **Combine with TTL**: Use TTL to manage the lifecycle of compressed data
6. **Test with Real Data**: Test compression with your actual data to measure benefits
7. **Handle Errors**: Implement proper error handling for compression/decompression failures
