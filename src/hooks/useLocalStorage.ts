import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item) as T);
    } catch { /* ignore */
      //
    }
    setMounted(true);
  }, [key]);

  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */
      //
    }
  }, [key]);

  return [mounted ? storedValue : initialValue, setValue] as const;
}
