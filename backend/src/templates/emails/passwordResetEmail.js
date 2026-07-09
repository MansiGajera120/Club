import { renderLayout, renderButton } from './baseLayout.js';

/**
 * Password-reset message.
 * @param {{ name: string, resetUrl: string, expiresInMinutes: number }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const passwordResetEmail = ({ name, resetUrl, expiresInMinutes }) => {
  const subject = 'Reset your password';
  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;">Password reset</h1>
    <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">
      Hi ${name}, we received a request to reset your password. Click the button below
      to choose a new one. This link expires in ${expiresInMinutes} minutes.
    </p>
    ${renderButton({ label: 'Reset Password', url: resetUrl })}
    <p style="margin:0;color:#64748B;font-size:13px;line-height:1.6;">
      Or paste this link into your browser:<br />
      <a href="${resetUrl}" style="color:#4F46E5;word-break:break-all;">${resetUrl}</a>
    </p>`;

  return {
    subject,
    html: renderLayout({ title: subject, bodyHtml, previewText: 'Reset your password' }),
    text: `Reset your password: ${resetUrl} (expires in ${expiresInMinutes} minutes)`,
  };
};
