import { renderLayout } from './baseLayout.js';

/**
 * Email-verification one-time passcode (OTP) message. The user types this code
 * into the app to confirm their email address during signup.
 *
 * @param {{ name: string, code: string, expiresInMinutes: number }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const otpEmail = ({ name, code, expiresInMinutes }) => {
  const subject = `${code} is your verification code`;
  const spacedCode = code.split('').join(' ');
  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;">Welcome, ${name} 👋</h1>
    <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">
      Use the verification code below to confirm your email address and finish
      creating your account.
    </p>
    <div style="margin:24px 0;text-align:center;">
      <span style="display:inline-block;padding:16px 28px;background:#EEEBFF;border:1px solid #C7C2FF;border-radius:12px;color:#4338CA;font-size:30px;font-weight:700;letter-spacing:8px;">
        ${spacedCode}
      </span>
    </div>
    <p style="margin:0;color:#64748B;font-size:13px;line-height:1.6;">
      This code expires in ${expiresInMinutes} minutes. If you didn't request it,
      you can safely ignore this email.
    </p>`;

  return {
    subject,
    html: renderLayout({ title: subject, bodyHtml, previewText: `Your code is ${code}` }),
    text: `Welcome, ${name}. Your verification code is ${code}. It expires in ${expiresInMinutes} minutes.`,
  };
};

export default otpEmail;
