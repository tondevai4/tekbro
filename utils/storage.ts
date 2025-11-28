import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

// NOTE: MMKV Removed for Expo Go Compatibility
// The previous hybrid approach failed because the mere import of react-native-mmkv
// triggers NitroModules loading, which crashes Expo Go.
// We are reverting to pure AsyncStorage for now.

// General app preferences (Theme, Onboarding status, etc.)
export const appStorage = {
    // Sync methods - NOT SUPPORTED in pure AsyncStorage
    // We return null and warn, similar to the fallback behavior
    getString: (key: string) => {
        console.warn(`[Storage] getString(${key}) called. Returning null. Use getStringAsync for universal support.`);
        return null;
    },
    set: (key: string, value: string | boolean | number) => {
        AsyncStorage.setItem(key, String(value));
    },
    delete: (key: string) => {
        AsyncStorage.removeItem(key);
    },

    // Async methods (Universal support)
    getStringAsync: async (key: string) => {
        return await AsyncStorage.getItem(key);
    },
    setAsync: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
    }
};

// Zustand Middleware Adapter
export const zustandStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await AsyncStorage.getItem(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await AsyncStorage.removeItem(name);
    },
};
