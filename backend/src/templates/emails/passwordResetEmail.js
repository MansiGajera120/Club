import { renderLayout } from './baseLayout.js';

/**
 * Password-reset one-time passcode (OTP) email. The user types this code into
 * the app to choose a new password.
 * @param {{ name: string, code: string, expiresInMinutes: number }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const passwordResetEmail = ({ name, code, expiresInMinutes }) => {
  const subject = `${code} is your password reset code`;
  const spacedCode = code.split('').join('  ');

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.3px;">
      Password Reset
    </h1>
    <p style="margin:0 0 24px;color:#6B7280;font-size:15px;line-height:1.65;">
      Hi <strong style="color:#111827;">${name}</strong>, we received a request to reset your
      <strong style="color:#111827;">ClubHub</strong> password. Enter the code below in the app to
      choose a new one.
    </p>

    <!-- OTP Code Box -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background:linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%);border:2px solid #BFDBFE;border-radius:16px;padding:20px 36px;text-align:center;">
            <p style="margin:0 0 6px;color:#9CA3AF;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Your Reset Code</p>
            <span style="display:block;color:#2563EB;font-size:36px;font-weight:800;letter-spacing:10px;font-family:'Courier New',Courier,monospace;">
              ${spacedCode}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#9CA3AF;font-size:13px;line-height:1.6;text-align:center;">
      ⏱ This code expires in <strong style="color:#111827;">${expiresInMinutes} minutes</strong>.<br/>
      If you didn't request a password reset, you can safely ignore this email — your password won't change.
    </p>`;

  return {
    subject,
    html: renderLayout({ title: subject, bodyHtml, previewText: `Your reset code is ${code}` }),
    text: `Your ClubHub password reset code is ${code}. It expires in ${expiresInMinutes} minutes.`,
  };
};
