export interface CompressionOptions {
  dictionarySize: number;
}

export interface CompressionMeta {
  originalSize: number;
  compressedSize: number;
  algorithm: string;
  dictionarySize: number;
}
