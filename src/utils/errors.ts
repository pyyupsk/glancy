export class GlancyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GlancyError';
  }
}

export class CompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompressionError';
  }
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}
