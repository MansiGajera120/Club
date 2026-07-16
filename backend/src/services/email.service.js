import config from '../config/index.js';
import { sendEmail } from '../utils/mailer.js';
import { verificationEmail } from '../templates/emails/verificationEmail.js';
import { otpEmail } from '../templates/emails/otpEmail.js';
import { passwordResetEmail } from '../templates/emails/passwordResetEmail.js';
import { EMAIL_OTP_TTL_MS, PASSWORD_RESET_TTL_MS } from '../constants/auth.js';

/**
 * Build a client-facing URL for a token-based action. The web client (admin
 * panel) and the mobile app both handle these routes.
 */
const buildClientUrl = (path, token) =>
  `${config.server.clientUrl}${path}?token=${encodeURIComponent(token)}`;

/**
 * Send the email-verification message.
 * @param {{ name: string, email: string }} user
 * @param {string} rawToken plaintext token (emailed; only its hash is stored)
 */
export const sendVerificationEmail = async (user, rawToken) => {
  const verifyUrl = buildClientUrl('/verify-email', rawToken);
  const { subject, html, text } = verificationEmail({
    name: user.name,
    verifyUrl,
  });
  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email-verification OTP code (used by the in-app signup flow).
 * @param {{ name: string, email: string }} user
 * @param {string} code plaintext OTP (only its hash is stored)
 */
export const sendOtpEmail = async (user, code) => {
  const { subject, html, text } = otpEmail({
    name: user.name,
    code,
    expiresInMinutes: Math.floor(EMAIL_OTP_TTL_MS / 60000),
  });
  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send the password-reset OTP message.
 * @param {{ name: string, email: string }} user
 * @param {string} code plaintext OTP (only its hash is stored)
 */
export const sendPasswordResetEmail = async (user, code) => {
  const { subject, html, text } = passwordResetEmail({
    name: user.name,
    code,
    expiresInMinutes: Math.floor(PASSWORD_RESET_TTL_MS / 60000),
  });
  await sendEmail({ to: user.email, subject, html, text });
};
