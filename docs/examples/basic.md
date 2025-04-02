# Basic Usage Examples

## Simple Storage

Here's a basic example of storing and retrieving data:

```typescript
import { Glancy } from 'glancy';

// Create a new instance
const storage = new Glancy();

// Store some data
await storage.set('user', {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true,
  },
});

// Retrieve the data
const result = await storage.get('user');
if (result.success) {
  console.log(result.data);
  // {
  //   name: 'John Doe',
  //   email: 'john@example.com',
  //   preferences: {
  //     theme: 'dark',
  //     notifications: true
  //   }
  // }
}
```

## Working with Arrays

Store and retrieve arrays:

```typescript
// Store an array
await storage.set('todos', [
  { id: 1, text: 'Learn Glancy', completed: false },
  { id: 2, text: 'Build something cool', completed: false },
]);

// Retrieve and update
const todosResult = await storage.get('todos');
if (todosResult.success && todosResult.data) {
  const todos = todosResult.data;
  todos[0].completed = true;

  // Save the updated array
  await storage.set('todos', todos);
}
```

## Working with Objects

Handle complex objects:

```typescript
// Store a complex object
const config = {
  api: {
    baseUrl: 'https://api.example.com',
    endpoints: {
      users: '/users',
      posts: '/posts',
    },
    headers: {
      'Content-Type': 'application/json',
    },
  },
  settings: {
    cache: true,
    timeout: 5000,
  },
};

await storage.set('appConfig', config);

// Retrieve and use
const configResult = await storage.get('appConfig');
if (configResult.success && configResult.data) {
  const { api, settings } = configResult.data;
  console.log(`API Base URL: ${api.baseUrl}`);
  console.log(`Cache enabled: ${settings.cache}`);
}
```

## Error Handling

Handle errors gracefully:

```typescript
// Try to get a non-existent key
const result = await storage.get('nonexistent');
if (!result.success) {
  console.error(`Error: ${result.message}`);
  // Error: Item not found
}

// Try to set invalid data
try {
  await storage.set('invalid', undefined);
} catch (error) {
  console.error('Failed to store data:', error);
}
```

## Checking Existence

Check if data exists:

```typescript
// Check if a key exists
const hasUser = await storage.has('user');
if (hasUser.success && hasUser.data) {
  console.log('User data exists');
}

// Get all keys
const keysResult = storage.keys();
if (keysResult.success && keysResult.data) {
  console.log('Available keys:', keysResult.data);
  // ['user', 'todos', 'appConfig']
}
```

## Removing Data

Remove data when no longer needed:

```typescript
// Remove a single item
const removeResult = storage.remove('todos');
if (removeResult.success) {
  console.log('Todos removed successfully');
}

// Remove all data
const clearResult = storage.clear();
if (clearResult.success) {
  console.log('All data cleared');
}
```
