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

import { GlancyError } from './errors';

export function validateStorageKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new GlancyError('Invalid storage key');
  }
}

export function validateTTL(ttl?: number): void {
  if (ttl !== undefined && (!Number.isInteger(ttl) || ttl < 0)) {
    throw new GlancyError('Invalid TTL value');
  }
}
