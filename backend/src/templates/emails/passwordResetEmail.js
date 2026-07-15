import { renderLayout, renderButton } from './baseLayout.js';

/**
 * Password-reset email with a CTA button.
 * @param {{ name: string, resetUrl: string, expiresInMinutes: number }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const passwordResetEmail = ({ name, resetUrl, expiresInMinutes }) => {
  const subject = 'Reset your ClubHub password';

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#262525;letter-spacing:-0.3px;">
      Password Reset
    </h1>
    <p style="margin:0 0 16px;color:#6B7280;font-size:15px;line-height:1.65;">
      Hi <strong style="color:#262525;">${name}</strong>, we received a request to reset your
      <strong style="color:#262525;">ClubHub</strong> password.
      Click the button below to choose a new one.
    </p>

    <!-- Warning banner -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 4px;">
      <tr>
        <td style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:12px 16px;">
          <p style="margin:0;color:#92400E;font-size:13px;line-height:1.5;">
            ⏱ This link expires in <strong>${expiresInMinutes} minutes</strong>.
            If you didn't request a reset, you can safely ignore this email — your password will not change.
          </p>
        </td>
      </tr>
    </table>

    ${renderButton({ label: 'Reset My Password →', url: resetUrl })}

    <div style="background:#F7F8FA;border-radius:10px;padding:14px 16px;border:1px solid #EEEFF2;">
      <p style="margin:0 0 4px;color:#9CA3AF;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Or copy this link into your browser</p>
      <a href="${resetUrl}" style="color:#F97316;font-size:12px;word-break:break-all;text-decoration:none;">${resetUrl}</a>
    </div>`;

  return {
    subject,
    html: renderLayout({ title: subject, bodyHtml, previewText: 'Reset your ClubHub password' }),
    text: `Reset your password: ${resetUrl} (expires in ${expiresInMinutes} minutes)`,
  };
};
