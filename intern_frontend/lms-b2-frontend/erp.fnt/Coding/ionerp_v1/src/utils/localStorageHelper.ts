export const LocalStorageHelper = {
    setObject<T>(key: string, value: T): void {
      try {
        const serializedValue = JSON.stringify({
          value,
          expiry: Date.now() + 120 * 60 * 1000,
        });
        localStorage.setItem(key, serializedValue);
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage`, error);
      }
    },
  
    getObject<T>(key: string): T | null {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const { value, expiry } = JSON.parse(item);
          if (Date.now() > expiry) {
            localStorage.removeItem(key);
            return null;
          }
          return value as T;
        }
        return null;
      } catch (error) {
        console.error(`Failed to retrieve ${key} from localStorage`, error);
        return null;
      }
    },
  
    setItem(key: string, value: string): void {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage`, error);
      }
    },
  
    getItem(key: string): string | null {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error(`Failed to retrieve ${key} from localStorage`, error);
        return null;
      }
    },
  
    removeItem(key: string): void {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key} from localStorage`, error);
      }
    },
  
    removeAll(): void {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Failed to remove all items from localStorage', error);
      }
    },
  
  };