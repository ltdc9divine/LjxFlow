/**
 * UUID generation utility for LjxFlow.
 *
 * Uses `expo-crypto.randomUUID()` which is the Expo-recommended approach
 * for generating UUIDs in managed Expo apps. This is available in Expo Go
 * without any native module configuration.
 */

import { randomUUID } from "expo-crypto";

export function generateId(): string {
  return randomUUID();
}
