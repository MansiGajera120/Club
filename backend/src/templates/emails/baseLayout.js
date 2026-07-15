import config from '../../config/index.js';

/**
 * Wrap email body content in a clean, responsive HTML layout that mirrors
 * the ClubHub design system — orange brand, rounded card, soft background.
 * All transactional emails render through this for visual consistency.
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
  <body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Inter',sans-serif;color:#262525;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FA;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;background:#FFFFFF;border:1px solid #EEEFF2;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#F97316 0%,#FB923C 100%);padding:28px 36px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:rgba(255,255,255,0.22);border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                      <span style="color:#FFFFFF;font-size:22px;line-height:44px;">🏆</span>
                    </td>
                    <td style="padding-left:14px;">
                      <span style="color:#FFFFFF;font-size:20px;font-weight:800;letter-spacing:-0.3px;">${config.smtp.fromName}</span><br/>
                      <span style="color:rgba(255,255,255,0.80);font-size:12px;font-weight:500;">Admin Portal</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 36px 24px;border-top:1px solid #EEEFF2;background:#FAFBFC;">
                <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.6;">
                  You received this email because an account action was requested for this address.
                  If this wasn't you, you can safely ignore it.
                </p>
              </td>
            </tr>

          </table>

          <!-- Bottom copyright -->
          <p style="color:#9CA3AF;font-size:12px;margin:18px 0 0;">© ${new Date().getFullYear()} ${config.smtp.fromName}. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

/**
 * Reusable primary CTA button (table-based for email client compatibility).
 * @param {{ label: string, url: string }} params
 */
export const renderButton = ({ label, url }) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="border-radius:12px;background:linear-gradient(135deg,#F97316 0%,#FB923C 100%);box-shadow:0 4px 14px rgba(249,115,22,0.35);">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.2px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
