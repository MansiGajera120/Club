import { renderLayout, renderButton } from './baseLayout.js';

/**
 * Email-verification message with a CTA button.
 * @param {{ name: string, verifyUrl: string }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const verificationEmail = ({ name, verifyUrl }) => {
  const subject = 'Verify your email address';

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#262525;letter-spacing:-0.3px;">
      Welcome, ${name}! 👋
    </h1>
    <p style="margin:0 0 8px;color:#6B7280;font-size:15px;line-height:1.65;">
      Thanks for signing up to <strong style="color:#262525;">ClubHub</strong>.
      Please confirm your email address to activate your account.
    </p>
    <p style="margin:0 0 4px;color:#6B7280;font-size:15px;line-height:1.65;">
      Just click the button below — it only takes a second.
    </p>

    ${renderButton({ label: 'Verify My Email →', url: verifyUrl })}

    <div style="background:#F7F8FA;border-radius:10px;padding:14px 16px;border:1px solid #EEEFF2;">
      <p style="margin:0 0 4px;color:#9CA3AF;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Or copy this link into your browser</p>
      <a href="${verifyUrl}" style="color:#F97316;font-size:12px;word-break:break-all;text-decoration:none;">${verifyUrl}</a>
    </div>`;

  return {
    subject,
    html: renderLayout({ title: subject, bodyHtml, previewText: 'Verify your email to activate your account' }),
    text: `Welcome, ${name}. Verify your email: ${verifyUrl}`,
  };
};
