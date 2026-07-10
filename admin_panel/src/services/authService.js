import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';

/**
 * Auth API calls for the admin panel. Returns the `data` payload from the
 * standard `{ success, message, data }` envelope so callers work with plain
 * objects.
 */
export const authService = {
  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   */
  async login(credentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data;
  },

  /** Fetch the currently-authenticated user. */
  async getMe() {
    const { data } = await apiClient.get('/auth/me');
    return data.data.user;
  },

  /**
   * Start the password-reset flow. The API always resolves the same way
   * (anti-enumeration), so this never reveals whether the email exists.
   * @param {string} email
   */
  async forgotPassword(email) {
    await apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Complete a password reset with the emailed token.
   * @param {{ token: string, password: string }} payload
   */
  async resetPassword({ token, password }) {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  /**
   * Change the signed-in admin's password. Revokes existing sessions server-side.
   * @param {{ currentPassword: string, newPassword: string }} payload
   */
  async changePassword({ currentPassword, newPassword }) {
    await apiClient.patch('/users/me/password', { currentPassword, newPassword });
  },

  /**
   * Revoke the refresh token server-side. Best-effort — never throws so the UI
   * can always complete a local logout.
   * @param {string} [refreshToken] defaults to the stored token
   */
  async logout(refreshToken = tokenStorage.getRefreshToken()) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // ignore — local session is cleared regardless
    }
  },
};

export default authService;
