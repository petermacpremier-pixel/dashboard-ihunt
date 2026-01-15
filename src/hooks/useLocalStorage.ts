import { useState, useEffect, useCallback } from 'react';

const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredData<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed: StoredData<T> = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      
      return parsed.value;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      const dataToStore: StoredData<T> = {
        value: valueToStore,
        timestamp: Date.now(),
        expiresAt: Date.now() + EXPIRY_MS,
      };
      
      window.localStorage.setItem(key, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Helper to get value without hooks (for initial checks)
export function getStoredValue<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    
    const parsed: StoredData<T> = JSON.parse(item);
    
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(key);
      return null;
    }
    
    return parsed.value;
  } catch {
    return null;
  }
}

// Helper to set value without hooks
export function setStoredValue<T>(key: string, value: T): void {
  try {
    const dataToStore: StoredData<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + EXPIRY_MS,
    };
    window.localStorage.setItem(key, JSON.stringify(dataToStore));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
}
