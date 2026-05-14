import { AsyncLocalStorage } from "node:async_hooks";

export const userIdStorage = new AsyncLocalStorage<string>();

export const DEFAULT_USER_ID = "user_1";

export function getCurrentUserId(): string {
  return userIdStorage.getStore() ?? DEFAULT_USER_ID;
}
