# TTL (Time-To-Live) Examples

Glancy provides Time-To-Live (TTL) functionality to automatically expire data after a specified period. Here are some examples of how to use TTL in your applications.

## Basic TTL

```typescript
import { Glancy } from 'glancy';

// Create a storage instance with a default TTL
const storage = new Glancy({
  defaultTTL: 3600000, // 1 hour in milliseconds
});

// Store data with default TTL
await storage.set('user', { name: 'John', age: 30 });
// This will expire after 1 hour

// Store data with custom TTL
await storage.set('temporary', { data: 'This will expire soon' }, 300000); // 5 minutes

// Retrieve data before it expires
const result = await storage.get('temporary');
if (result.success) {
  console.log(result.data); // { data: 'This will expire soon' }
}

// Wait for 5 minutes...

// Try to retrieve after expiration
const expiredResult = await storage.get('temporary');
if (expiredResult.success) {
  console.log(expiredResult.data); // null
  console.log(expiredResult.message); // 'Item expired'
}
```

## Checking TTL

You can check the remaining TTL of an item:

```typescript
// Store an item with TTL
await storage.set('session', { token: 'abc123' }, 1800000); // 30 minutes

// Check remaining TTL
const ttlResult = await storage.getTTL('session');
if (ttlResult.success && ttlResult.data !== null) {
  const remainingMinutes = Math.floor(ttlResult.data / 60000);
  console.log(`Session expires in ${remainingMinutes} minutes`);
}
```

## Extending TTL

You can extend the TTL of an existing item:

```typescript
// Store an item with short TTL
await storage.set('session', { token: 'abc123' }, 300000); // 5 minutes

// Extend the TTL
const touchResult = await storage.touch('session', 3600000); // Extend to 1 hour
if (touchResult.success && touchResult.data) {
  console.log('TTL extended successfully');
}

// Check the new TTL
const ttlResult = await storage.getTTL('session');
if (ttlResult.success && ttlResult.data !== null) {
  const remainingMinutes = Math.floor(ttlResult.data / 60000);
  console.log(`Session now expires in ${remainingMinutes} minutes`);
}
```

## Session Management Example

Here's a practical example of using TTL for session management:

```typescript
// Create a session manager
class SessionManager {
  private storage: Glancy;

  constructor() {
    this.storage = new Glancy({
      defaultTTL: 3600000, // 1 hour default
    });
  }

  async createSession(userId: string, data: any) {
    const sessionId = `session:${userId}:${Date.now()}`;
    await this.storage.set(
      sessionId,
      {
        userId,
        data,
        createdAt: Date.now(),
      },
      1800000
    ); // 30 minutes TTL

    return sessionId;
  }

  async getSession(sessionId: string) {
    const result = await this.storage.get(sessionId);
    if (!result.success || !result.data) {
      return null;
    }

    // Extend the session TTL on access
    await this.storage.touch(sessionId, 1800000); // Reset to 30 minutes

    return result.data;
  }

  async endSession(sessionId: string) {
    return this.storage.remove(sessionId);
  }
}

// Usage
const sessionManager = new SessionManager();

// Create a session
const sessionId = await sessionManager.createSession('user123', {
  preferences: { theme: 'dark' },
  lastLogin: Date.now(),
});

// Get session data
const session = await sessionManager.getSession(sessionId);
if (session) {
  console.log(`Session for user ${session.userId}`);
  console.log(`Created at: ${new Date(session.createdAt).toLocaleString()}`);
}

// End session
await sessionManager.endSession(sessionId);
```

## Cache Management Example

Here's an example of using TTL for caching:

```typescript
// Create a cache manager
class CacheManager {
  private storage: Glancy;

  constructor(defaultTTL: number = 3600000) {
    // 1 hour default
    this.storage = new Glancy({
      defaultTTL,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.storage.get<T>(key);
    if (!result.success || !result.data) {
      return null;
    }
    return result.data;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.storage.set(key, value, ttl);
  }

  async invalidate(key: string): Promise<void> {
    await this.storage.remove(key);
  }

  async invalidateAll(): Promise<void> {
    await this.storage.clear();
  }
}

// Usage
const cache = new CacheManager(1800000); // 30 minutes default TTL

// Cache API response
async function fetchUserData(userId: string) {
  // Try to get from cache first
  const cachedData = await cache.get(`user:${userId}`);
  if (cachedData) {
    console.log('Data retrieved from cache');
    return cachedData;
  }

  // If not in cache, fetch from API
  console.log('Fetching data from API');
  const response = await fetch(`https://api.example.com/users/${userId}`);
  const data = await response.json();

  // Store in cache
  await cache.set(`user:${userId}`, data, 1800000); // 30 minutes TTL

  return data;
}
```

## TTL Best Practices

1. **Choose Appropriate TTL Values**: Set TTL values based on data freshness requirements
2. **Use Namespaces**: Use key namespaces to group related data with similar TTL requirements
3. **Extend TTL on Access**: Use `touch()` to extend TTL when data is accessed
4. **Monitor Expiration**: Implement monitoring to track data expiration
5. **Handle Expiration Gracefully**: Always check for expired data in your application logic
6. **Combine with Other Features**: Use TTL with encryption and compression for comprehensive data management
7. **Consider Storage Limits**: Be mindful of storage limits when using TTL for large datasets
