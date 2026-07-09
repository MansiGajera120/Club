import config from '../../config/index.js';

/**
 * Wrap email body content in a clean, responsive HTML layout that mirrors the
 * product's design system (primary blue, rounded card, soft background). All
 * transactional emails render through this so they stay visually consistent.
 *
 * @param {{ title: string, bodyHtml: string, previewText?: string }} params
 * @returns {string}
 */
export const renderLayout = ({ title, bodyHtml, previewText = '' }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F172A;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#4F46E5;background-image:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);padding:24px 32px;">
                <span style="color:#FFFFFF;font-size:18px;font-weight:700;">${config.smtp.fromName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #E2E8F0;">
                <p style="margin:0;color:#64748B;font-size:12px;line-height:1.5;">
                  You received this email because an account action was requested for this address.
                  If this wasn't you, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>
          <p style="color:#94A3B8;font-size:12px;margin:16px 0 0;">© ${config.smtp.fromName}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

/**
 * Reusable primary button (table-based for email client compatibility).
 * @param {{ label: string, url: string }} params
 */
export const renderButton = ({ label, url }) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:12px;background:#4F46E5;background-image:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 28px;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
