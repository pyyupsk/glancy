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

import type { GlancyResponse } from '../types';

export function validateStorageKey(key: string): GlancyResponse<void> {
  if (!key || typeof key !== 'string') {
    return {
      success: false,
      message: 'Invalid storage key',
      data: undefined,
    };
  }
  return {
    success: true,
    message: 'Storage key is valid',
    data: undefined,
  };
}

export function validateTTL(ttl?: number): GlancyResponse<void> {
  if (ttl !== undefined && (!Number.isInteger(ttl) || ttl < 0)) {
    return {
      success: false,
      message: 'Invalid TTL value',
      data: undefined,
    };
  }
  return {
    success: true,
    message: 'TTL is valid',
    data: undefined,
  };
}
