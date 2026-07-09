import { renderLayout, renderButton } from './baseLayout.js';

/**
 * Email-verification message.
 * @param {{ name: string, verifyUrl: string }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const verificationEmail = ({ name, verifyUrl }) => {
  const subject = 'Verify your email address';
  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;">Welcome, ${name} 👋</h1>
    <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">
      Thanks for signing up. Please confirm your email address to activate your account.
    </p>
    ${renderButton({ label: 'Verify Email', url: verifyUrl })}
    <p style="margin:0;color:#64748B;font-size:13px;line-height:1.6;">
      Or paste this link into your browser:<br />
      <a href="${verifyUrl}" style="color:#4F46E5;word-break:break-all;">${verifyUrl}</a>
    </p>`;

  return {
    subject,
    html: renderLayout({ title: subject, bodyHtml, previewText: 'Verify your email' }),
    text: `Welcome, ${name}. Verify your email: ${verifyUrl}`,
  };
};
