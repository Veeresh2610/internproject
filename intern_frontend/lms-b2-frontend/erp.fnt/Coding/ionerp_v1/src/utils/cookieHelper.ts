import Cookies from 'js-cookie';

interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

const defaultOptions: CookieOptions = {
  expires: 7, // 7 days
  // path: '/',
  // sameSite: 'strict'
};

export const CookieHelper = {
  set: (key: string, value: string, options: CookieOptions = {}) => {
    Cookies.set(key, value, { ...defaultOptions, ...options });
  },

  get: (key: string): string | null => {
    return Cookies.get(key) || null;
  },

  remove: (key: string, options: CookieOptions = {}) => {
    Cookies.remove(key, { ...defaultOptions, ...options });
  },

  setObject: (key: string, value: object, options: CookieOptions = {}) => {
    CookieHelper.set(key, JSON.stringify(value), options);
  },

  getObject: <T>(key: string): T | null => {
    const value = CookieHelper.get(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  removeAll: () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' }); // Remove from root path
    });
  }
};