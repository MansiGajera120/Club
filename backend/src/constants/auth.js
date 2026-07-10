/** Time-to-live for single-use auth tokens, in milliseconds. */
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** Email one-time passcode (OTP) used for signup verification. */
export const EMAIL_OTP_LENGTH = 6;
export const EMAIL_OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
/** Max wrong OTP guesses before the code is invalidated (must be re-requested). */
export const EMAIL_OTP_MAX_ATTEMPTS = 5;
