import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { tokenStorage } from '@/services/tokenStorage';
import { authService } from '@/services/authService';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'parent'|'club_owner'|'admin'} role
 * @property {string} [avatarUrl]
 */

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(undefined);

/**
 * Holds the authenticated admin's session. On mount it restores the session by
 * calling `/auth/me` when a token exists (the Axios interceptor transparently
 * refreshes an expired access token). Only users with the `admin` role are
 * allowed to sign in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!tokenStorage.getAccessToken()) {
        if (active) setIsInitializing(false);
        return;
      }
      try {
        const restored = await authService.getMe();
        if (active) setUser(restored?.role === 'admin' ? restored : null);
        if (restored?.role !== 'admin') tokenStorage.clear();
      } catch {
        tokenStorage.clear();
        if (active) setUser(null);
      } finally {
        if (active) setIsInitializing(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Authenticate with email + password. Rejects non-admin accounts (and revokes
   * the just-issued refresh token) so only admins can enter the panel.
   */
  const signIn = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    if (data.user.role !== 'admin') {
      await authService.logout(data.refreshToken);
      throw new Error('This account is not authorized to access the admin panel.');
    }
    tokenStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      signIn,
      setUser,
      logout,
    }),
    [user, isInitializing, signIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
