import transporter from '../../config/email/email.config.js';
import { logger } from '../../shared/utils/devHelper.js';
import { logNotificationDelivery } from '../notification/notification.service.js';

/**
 * Custom templating engine supporting Handlebars-style syntax (e.g. {{user.name}})
 */
export const renderTemplate = (template: string, variables: Record<string, any>): string => {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    const keys = key.split('.');
    let value: any = variables;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return match; // Return the match if nested key is unresolved
      }
    }
    
    return value !== undefined ? String(value) : '';
  });
};

/**
 * Sends a templated HTML/Text email with attachments support
 */
export const sendTemplatedEmail = async (params: {
  to: string;
  subject: string;
  templateText: string; // HTML template content
  variables: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
  announcementId?: number;
  userId?: string;
}) => {
  const { to, subject, templateText, variables, attachments, announcementId, userId } = params;

  try {
    const html = renderTemplate(templateText, variables);
    // Simple HTML-to-text fallback by stripping tags
    const text = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@tionix-one.com',
      to,
      subject,
      html,
      text,
      attachments: attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`[EmailService] Sent email successfully to ${to}. ID: ${info.messageId}`);
    
    if (announcementId) {
      await logNotificationDelivery({
        announcementId,
        userId: userId || null,
        channel: 'email',
        status: 'sent',
      });
    }
    
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    logger.error(`[EmailService] Failed to send email to ${to}:`, err);
    
    if (announcementId) {
      await logNotificationDelivery({
        announcementId,
        userId: userId || null,
        channel: 'email',
        status: 'failed',
        errorMessage: err.message,
      });
    }
    
    throw err;
  }
};
