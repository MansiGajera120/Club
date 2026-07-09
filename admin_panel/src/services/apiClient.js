import axios from 'axios';

import { env } from '@/config/env';
import { ROUTES } from '@/constants';
import { tokenStorage } from './tokenStorage';

/**
 * Pre-configured Axios instance used by every service. Owns:
 *  - base URL & JSON defaults
 *  - request interceptor that attaches the bearer token
 *  - response interceptor that transparently refreshes an expired access token
 *    once, then retries the original request
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  // Bare axios (not apiClient) so this request skips the interceptors below.
  const { data } = await axios.post(`${env.apiUrl}/auth/refresh`, { refreshToken });
  const tokens = {
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
  };
  tokenStorage.setTokens(tokens);
  return tokens.accessToken;
}

function forceLogout() {
  tokenStorage.clear();
  if (
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith(ROUTES.login)
  ) {
    window.location.assign(ROUTES.login);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url ?? '';

    const isAuthRoute = url.includes('/auth/refresh') || url.includes('/auth/login');

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Extract a human-readable message from an Axios error, falling back sensibly.
 * @param {unknown} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? 'Request failed';
  }
  return 'Something went wrong';
}

export default apiClient;
