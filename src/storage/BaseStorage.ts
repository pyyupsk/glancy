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

import type { IStorage, GlancyOptions, GlancyResponse } from '../types';

export abstract class BaseStorage implements IStorage {
  protected readonly namespace: string;

  constructor(options: GlancyOptions = {}) {
    this.namespace =
      options.namespace || process.env.GLANCY_NAMESPACE || 'glancy';
  }

  abstract get<T>(key: string): Promise<GlancyResponse<T>>;
  abstract set<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<GlancyResponse<void>>;
  abstract remove(key: string): GlancyResponse<void>;
  abstract clear(): GlancyResponse<void>;
  abstract keys(): GlancyResponse<string[]>;
  abstract has(key: string): Promise<GlancyResponse<boolean>>;
  abstract touch(key: string, ttl?: number): Promise<GlancyResponse<boolean>>;
  abstract getTTL(key: string): Promise<GlancyResponse<number | null>>;
  abstract size(): GlancyResponse<number>;

  protected getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  protected isExpired(item: { timestamp: number; ttl?: number }): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }
}
