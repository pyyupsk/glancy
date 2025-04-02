# glancy

## 1.0.0

### Major Changes

- **Breaking changes**: Refactored key methods to return a standardized `GlancyResponse` object, providing structured responses with `success`, `message`, and `data` properties for all storage operations.
- **Async/Await**: Migrated several storage operations (such as `get`, `set`, `getMany`, `setMany`, etc.) to async functions, requiring consumers to handle them asynchronously.
- **Improved error handling**: Enhanced error messages and responses in methods like `get`, `set`, `remove`, and `clear`, to include more detailed feedback in the response object.
- **Updated storage methods**: Refactored methods such as `getTTL`, `has`, and `touch` to ensure they now return structured responses with more information on success or failure.

#### Changes

- **Compression & Encryption**: Updated the compression and encryption mechanisms, including refactoring to make the compression level configurable.
- **Enhanced validation**: Improved validation of keys and TTL (time-to-live) values across multiple storage operations.

## 0.0.3

### Patch Changes

- Update vulnerable dependencies to patch security issues.

## 0.0.2

### Patch Changes

- Fix error messages in tests and update dependencies.

## 0.0.1

### Initial Release

- Initial release.
