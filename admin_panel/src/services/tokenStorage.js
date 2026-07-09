import { STORAGE_KEYS } from '@/constants';

/**
 * Small wrapper around localStorage for auth tokens. Centralized so token
 * handling (and any future migration to cookies) lives in one place.
 */
export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  },

  setTokens({ accessToken, refreshToken }) {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  },

  clear() {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  },
};

export default tokenStorage;
