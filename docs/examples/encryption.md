# Encryption Examples

Glancy provides built-in encryption using AES to keep your data secure. Here are some examples of how to use encryption in your applications.

## Basic Encryption

```typescript
import { Glancy } from 'glancy';

// Create a storage instance with encryption enabled
const storage = new Glancy({
  encryption: {
    enabled: true,
    key: 'your-secure-key-here',
  },
});

// Store encrypted data
await storage.set('user', {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed-password-here',
});

// Retrieve and automatically decrypt
const result = await storage.get('user');
if (result.success) {
  console.log(result.data);
  // {
  //   id: 1,
  //   name: 'John Doe',
  //   email: 'john@example.com',
  //   password: 'hashed-password-here'
  // }
}
```

## Secure Key Management

For production applications, you should manage your encryption keys securely:

```typescript
// In a real application, you would load this from a secure environment variable
// or a secure key management service
const ENCRYPTION_KEY =
  process.env.GLANCY_ENCRYPTION_KEY || 'fallback-key-for-development';

const storage = new Glancy({
  encryption: {
    enabled: true,
    key: ENCRYPTION_KEY,
  },
});
```

## Sensitive Data Example

Here's an example of storing sensitive user data:

```typescript
// User data with sensitive information
const userData = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  creditCard: {
    number: '4111-1111-1111-1111',
    expiry: '12/25',
    cvv: '123',
  },
  addresses: [
    {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
    },
  ],
};

// Store with encryption
await storage.set('user:sensitive', userData);

// Retrieve and use
const result = await storage.get('user:sensitive');
if (result.success && result.data) {
  // Use the decrypted data
  const { name, email } = result.data;
  console.log(`Welcome back, ${name}!`);

  // Don't log sensitive data
  // console.log(result.data.creditCard); // Bad practice!
}
```

## Combining Encryption with TTL

You can combine encryption with TTL for temporary sensitive data:

```typescript
// Store sensitive session data with a short TTL
await storage.set(
  'session:token',
  {
    token: 'jwt-token-here',
    refreshToken: 'refresh-token-here',
    expiresAt: Date.now() + 3600000, // 1 hour from now
  },
  3600000
); // TTL of 1 hour

// The data will be automatically removed after 1 hour
// or when the TTL expires
```

## Batch Operations with Encryption

You can use batch operations with encrypted storage:

```typescript
// Store multiple encrypted items
await storage.setMany({
  'user:profile': { name: 'John', email: 'john@example.com' },
  'user:preferences': { theme: 'dark', notifications: true },
  'user:settings': { language: 'en', timezone: 'UTC' },
});

// Retrieve multiple encrypted items
const results = await storage.getMany([
  'user:profile',
  'user:preferences',
  'user:settings',
]);

if (results.success) {
  const { 'user:profile': profile, 'user:preferences': preferences } =
    results.data;
  console.log(`Welcome ${profile?.name}!`);
  console.log(`Your theme is set to ${preferences?.theme}`);
}
```

## Security Best Practices

1. **Use Strong Keys**: Always use strong, randomly generated keys for encryption
2. **Key Rotation**: Implement a key rotation strategy for production applications
3. **Secure Storage**: Never store encryption keys in your code or version control
4. **Minimize Sensitive Data**: Only store what you absolutely need
5. **Combine with TTL**: Use TTL for temporary sensitive data
6. **Validate Data**: Always validate data after decryption
7. **Error Handling**: Handle encryption/decryption errors gracefully
