export type AuthProvider = "google" | "kakao";

export interface TagPreference {
  name: string;
  weight: number;
}

export interface UserPrefs {
  tags: TagPreference[];
  level: "undergraduate" | "graduate" | "researcher" | "practitioner";
  dailyCount: number;
}

export interface StoredUser {
  id: string;
  name: string;
  provider: AuthProvider;
  createdAt: string;
  avatarUrl?: string;
}

// Prototype only: never store real auth tokens in localStorage.
const STORAGE_KEYS = {
  user: "gomguk_user",
  prefs: "gomguk_prefs",
} as const;

const memoryStorage = new Map<string, string>();

const canUseStorage = () => {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__gomguk_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const readItem = (key: string) => {
  if (canUseStorage()) {
    return window.localStorage.getItem(key);
  }
  return memoryStorage.get(key) ?? null;
};

const writeItem = (key: string, value: string) => {
  if (canUseStorage()) {
    window.localStorage.setItem(key, value);
    return "local";
  }
  memoryStorage.set(key, value);
  return "memory";
};

const removeItem = (key: string) => {
  if (canUseStorage()) {
    window.localStorage.removeItem(key);
    return;
  }
  memoryStorage.delete(key);
};

const safeParse = <T,>(raw: string | null) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const storageAvailable = () => canUseStorage();

export const getStoredUser = () => safeParse<StoredUser>(readItem(STORAGE_KEYS.user));

export const setStoredUser = (user: StoredUser) => {
  writeItem(STORAGE_KEYS.user, JSON.stringify(user));
};

export const clearStoredUser = () => {
  removeItem(STORAGE_KEYS.user);
};

export const getStoredPrefs = () => safeParse<UserPrefs>(readItem(STORAGE_KEYS.prefs));

export const setStoredPrefs = (prefs: UserPrefs) => {
  writeItem(STORAGE_KEYS.prefs, JSON.stringify(prefs));
};

export const clearStoredPrefs = () => {
  removeItem(STORAGE_KEYS.prefs);
};
