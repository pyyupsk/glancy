/*
 * Copyright 2025 Pongsakorn Thipayanate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface GlancyOptions {
  namespace?: string;
  encryption?: {
    enabled: boolean;
    key: string;
  };
  defaultTTL?: number;
  compress?: boolean;
  compressionLevel?: number;
}

export interface GlancyItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export interface GlancyResponse<T> {
  success: boolean;
  message: string;
  data: T | null | undefined;
}

export interface IStorage {
  get<T>(key: string): Promise<GlancyResponse<T>>;
  set<T>(key: string, value: T, ttl?: number): Promise<GlancyResponse<void>>;
  remove(key: string): GlancyResponse<void>;
  clear(): GlancyResponse<void>;
  keys(): GlancyResponse<string[]>;
  has(key: string): Promise<GlancyResponse<boolean>>;
  touch(key: string, ttl?: number): Promise<GlancyResponse<boolean>>;
  getTTL(key: string): Promise<GlancyResponse<number | null>>;
  size(): GlancyResponse<number>;
}
