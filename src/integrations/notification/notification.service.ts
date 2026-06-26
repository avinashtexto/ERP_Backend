import { db } from '../../config/db.config.js';
import { hr_notification, notification_log, userDevices } from '../../shared/database/schemas/index.js';
import { logger } from '../../shared/utils/devHelper.js';
import { messaging } from '../../config/firebase-admin.config.js';
import { eq } from 'drizzle-orm';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } from './notification.config.js';

/**
 * Dispatches an in-app notification by inserting into the hr_notification table
 */
export const sendInAppNotification = async (params: {
  announcementId: number;
  userId: number;
  message: string;
  fileName?: string | null;
  authorize?: boolean;
}) => {
  const { announcementId, userId, message, fileName, authorize } = params;
  try {
    const [inserted] = await db
      .insert(hr_notification)
      .values({
        form_name: 'Announcement and Notice',
        announcement: message,
        file_name: fileName || null,
        n_id: announcementId,
        edit_mode: 0, // 0 = Added, 1 = Edited
        fk_user_id: userId,
        authorize: authorize || false,
        not_date: new Date(),
      })
      .returning();

    logger.info(`[NotificationService] Created In-App notification for User: ${userId}, Announcement: ${announcementId}`);
    await logNotificationDelivery({
      announcementId,
      userId: String(userId),
      channel: 'inapp',
      status: 'sent',
    });
    return inserted;
  } catch (err: any) {
    logger.error('[NotificationService] In-App notification insertion failed:', err);
    await logNotificationDelivery({
      announcementId,
      userId: String(userId),
      channel: 'inapp',
      status: 'failed',
      errorMessage: err.message,
    });
    throw err;
  }
};

/**
 * Dispatches SMS notification using Twilio REST API directly via native fetch
 */
export const sendSMS = async (to: string, body: string, announcementId?: number, userId?: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    logger.warn(`[NotificationService] Twilio config missing. MOCK SMS to ${to}: "${body}"`);
    if (announcementId) {
      await logNotificationDelivery({
        announcementId,
        userId: userId || null,
        channel: 'sms',
        status: 'sent',
      });
    }
    return { success: true, messageId: 'MOCK_SMS_' + Date.now(), status: 'sent' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const basicAuth = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', TWILIO_FROM_NUMBER);
    params.append('Body', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Twilio response error');
    }

    logger.info(`[NotificationService] SMS successfully sent to ${to}. Sid: ${resData.sid}`);
    if (announcementId) {
      await logNotificationDelivery({
        announcementId,
        userId: userId || null,
        channel: 'sms',
        status: 'sent',
      });
    }
    return { success: true, messageId: resData.sid, status: resData.status };
  } catch (err: any) {
    logger.error(`[NotificationService] SMS dispatch failed to ${to}:`, err);
    if (announcementId) {
      await logNotificationDelivery({
        announcementId,
        userId: userId || null,
        channel: 'sms',
        status: 'failed',
        errorMessage: err.message,
      });
    }
    throw err;
  }
};

/**
 * Dispatches Mobile Push Notification using Firebase Admin SDK
 */
export const sendPushNotification = async (
  deviceToken: string,
  title: string,
  body: string,
  announcementId?: number,
  userId?: string
) => {
  try {
    let tokens: string[] = [];

    if (userId) {
      const dbTokens = await db
        .select({ token: userDevices.device_token })
        .from(userDevices)
        .where(eq(userDevices.user_id, parseInt(userId, 10)));
      tokens = dbTokens.map((t) => t.token);
    } else if (deviceToken && !deviceToken.startsWith('MOCK_TOKEN_')) {
      tokens = [deviceToken];
    }

    if (tokens.length === 0) {
      logger.info(`[NotificationService] No registered device tokens found for User: ${userId || 'N/A'}. Skipping push notification.`);
      return { success: true, messageId: 'NO_TOKENS' };
    }

    logger.info(`[NotificationService] Dispatching Push Notification to ${tokens.length} devices for User ${userId || 'N/A'}: [${title}] ${body}`);

    const sendPromises = tokens.map(async (token) => {
      try {
        const messageId = await messaging.send({
          token,
          notification: { title, body },
          android: {
            notification: {
              sound: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
              },
            },
          },
        });
        return { success: true, token, messageId };
      } catch (err: any) {
        logger.error(`[NotificationService] Push notification failed for token ${token}:`, err);
        return { success: false, token, error: err.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successfulSends = results.filter((r) => r.success);

    if (announcementId) {
      await logNotificationDelivery({
        announcementId,
        userId: userId || null,
        channel: 'push',
        status: successfulSends.length > 0 ? 'sent' : 'failed',
        errorMessage: successfulSends.length === 0 ? 'All sends failed' : null,
      });
    }

    return {
      success: successfulSends.length > 0,
      results,
    };
  } catch (err: any) {
    logger.error('[NotificationService] Push notification operation failed:', err);
    if (announcementId) {
      await logNotificationDelivery({
        announcementId,
        userId: userId || null,
        channel: 'push',
        status: 'failed',
        errorMessage: err.message,
      });
    }
    throw err;
  }
};

/**
 * Records notification delivery status in the database
 */
export const logNotificationDelivery = async (params: {
  announcementId: number;
  userId?: string | null;
  channel: 'email' | 'sms' | 'push' | 'inapp';
  status: 'sent' | 'failed' | 'bounced' | 'opened';
  errorMessage?: string | null;
}) => {
  try {
    const { announcementId, userId, channel, status, errorMessage } = params;
    const [log] = await db
      .insert(notification_log)
      .values({
        announcement_id: announcementId,
        user_id: userId || null,
        channel,
        status,
        sent_at: new Date(),
        delivered_at: status === 'sent' ? new Date() : null,
        error_message: errorMessage || null,
      })
      .returning();
    
    return log;
  } catch (err) {
    logger.error('[NotificationService] Failed to insert notification log:', err);
  }
};
