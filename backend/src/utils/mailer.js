import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../logger/index.js';

/**
 * Lazily-created Nodemailer transport. When SMTP is not configured (typical in
 * local dev) we fall back to a JSON transport that logs the email instead of
 * sending it, so the auth flow works end-to-end without a mail server.
 */
let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!config.smtp.host) {
    logger.warn('SMTP not configured — emails will be logged, not sent');
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth:
      config.smtp.user || config.smtp.pass
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined,
  });

  return transporter;
};

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string, text?: string }} message
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const from = `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`;
  const info = await getTransporter().sendMail({ from, to, subject, html, text });

  if (!config.smtp.host) {
    // jsonTransport: surface the payload so devs can grab verification links.
    logger.info(`Email (not sent) → ${to} | ${subject}`);
    logger.debug(String(info.message));
  } else {
    logger.info(`Email sent → ${to} | ${subject}`);
  }
};
