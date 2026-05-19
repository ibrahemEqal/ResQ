import AsyncStorage from "@react-native-async-storage/async-storage";

export const USER_STORAGE_KEY = "user";

/** Matches Firestore `users` docs + local-only fields */
export type StoredUser = {
  uid: string;
  email: string;
  fullName?: string;
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export async function saveUserLocally(userData: StoredUser): Promise<void> {
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
}

export async function getUserLocally(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function clearUserLocally(): Promise<void> {
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
}
