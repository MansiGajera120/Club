import { renderLayout } from './baseLayout.js';

/**
 * Email-verification one-time passcode (OTP) message.
 * The user types this code into the app to confirm their email during signup.
 *
 * @param {{ name: string, code: string, expiresInMinutes: number }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const otpEmail = ({ name, code, expiresInMinutes }) => {
  const subject = `${code} is your verification code`;
  const spacedCode = code.split('').join('  ');

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#262525;letter-spacing:-0.3px;">
      Welcome, ${name}! 👋
    </h1>
    <p style="margin:0 0 24px;color:#6B7280;font-size:15px;line-height:1.65;">
      Use the verification code below to confirm your email address and finish
      setting up your account.
    </p>

    <!-- OTP Code Box -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background:linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%);border:2px solid #FED7AA;border-radius:16px;padding:20px 36px;text-align:center;">
            <p style="margin:0 0 6px;color:#9CA3AF;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Your Verification Code</p>
            <span style="display:block;color:#F97316;font-size:36px;font-weight:800;letter-spacing:10px;font-family:'Courier New',Courier,monospace;">
              ${spacedCode}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#9CA3AF;font-size:13px;line-height:1.6;text-align:center;">
      ⏱ This code expires in <strong style="color:#262525;">${expiresInMinutes} minutes</strong>.<br/>
      If you didn't request this, you can safely ignore this email.
    </p>`;

  return {
    subject,
    html: renderLayout({ title: subject, bodyHtml, previewText: `Your code is ${code}` }),
    text: `Welcome, ${name}. Your verification code is ${code}. It expires in ${expiresInMinutes} minutes.`,
  };
};

export default otpEmail;
