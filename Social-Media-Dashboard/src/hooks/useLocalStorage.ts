import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage persistence
 * @param key The localStorage key
 * @param initialValue The initial value if no value exists in localStorage
 * @returns [value, setValue] tuple similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get value from localStorage on initial load
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Only access localStorage on client side
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Function to update both state and localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage (only on client side)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook specifically for AI-enabled states with predefined keys
 */
export function useAiEnabledState(platform: 'facebook' | 'instagram' | 'gmail' | 'social') {
  const key = `ai-enabled-${platform}`;
  return useLocalStorage<boolean>(key, false);
} 