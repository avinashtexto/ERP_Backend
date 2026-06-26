// src/queue/consumers/announcement.consumer.ts
import { connectRabbitMQ, getChannel } from '../../config/rabbitmq.config.js';
import { db } from '../../config/db.config.js';
import {
  hr_announcement,
  hr_emp_announcement,
  sal_structure,
  appUser,
  file_metadata,
  hr_notice_type,
} from '../../shared/database/schemas/index.js';
import { eq } from 'drizzle-orm';
import { sendInAppNotification, sendSMS, sendPushNotification } from '../../integrations/notification/notification.service.js';
import { sendTemplatedEmail } from '../../integrations/email/email.service.js';
import { syncToCloud, syncToExternalHR } from '../../config/sync/sync.service.js';
import { logger } from '../../shared/utils/devHelper.js';
import fs from 'fs/promises';
import path from 'path';

const NOTIFICATIONS_QUEUE = 'announcement-notifications';
const NOTIFICATIONS_EXCHANGE = 'announcement-notifications-exchange';
const NOTIFICATIONS_ROUTING_KEY = 'announcement-notifications';

const SYNC_QUEUE = 'announcement-sync';
const SYNC_EXCHANGE = 'announcement-sync-exchange';
const SYNC_ROUTING_KEY = 'announcement-sync';

let notificationsConsumerTag: string | null = null;
let syncConsumerTag: string | null = null;

/**
 * Processes announcement notifications
 */
const processNotifications = async (content: any) => {
  try {
    const data = JSON.parse(content.toString());
    const { announcementId } = data;
    logger.info(`[NotificationsConsumer] Processing notifications for announcement ID: ${announcementId}`);

    // 1. Fetch Announcement and Notice Type info
    const announcementResults = await db
      .select({
        id: hr_announcement.pk_an_id,
        text: hr_announcement.announcement,
        refNo: hr_announcement.ref_no,
        noticeType: hr_notice_type.type,
        fileName: hr_announcement.file_name,
      })
      .from(hr_announcement)
      .innerJoin(hr_notice_type, eq(hr_announcement.fk_nt_id, hr_notice_type.pk_nt_id))
      .where(eq(hr_announcement.pk_an_id, announcementId))
      .limit(1);

    const announcement = announcementResults[0];
    if (!announcement) {
      logger.warn(`[NotificationsConsumer] Announcement ${announcementId} not found. Skipping notifications.`);
      return;
    }

    // 2. Fetch target users mapped to this announcement
    const targetUsers = await db
      .select({
        userId: appUser.pk_user_id,
        username: appUser.username,
        email: appUser.email,
        mobile: appUser.mobile,
      })
      .from(hr_emp_announcement)
      .innerJoin(sal_structure, eq(hr_emp_announcement.fk_ss_id, sal_structure.pk_ss_id))
      .innerJoin(appUser, eq(sal_structure.fk_emp_id, appUser.fk_emp_id))
      .where(eq(hr_emp_announcement.fk_an_id, announcementId));

    logger.info(`[NotificationsConsumer] Found ${targetUsers.length} target users for announcement ${announcementId}`);

    const emailTemplate = `
      <h2>New HR Notice: {{noticeType}}</h2>
      <p>Dear {{username}},</p>
      <p>{{announcementText}}</p>
      <br/>
      <p>Please log in to your employee portal to view full details.</p>
      <hr/>
      <small>This is an automated notification. Please do not reply.</small>
    `;

    for (const user of targetUsers) {
      try {
        const uId = user.userId;
        const userName = user.username;

        logger.info(`[NotificationsConsumer] Sending notifications to ${userName} (ID: ${uId})...`);

        // Channel 1: In-App notification (Database insertion)
        await sendInAppNotification({
          announcementId,
          userId: uId,
          message: announcement.text,
          fileName: announcement.fileName || null,
        });

        // Channel 2: Email (if email address exists)
        if (user.email) {
          await sendTemplatedEmail({
            to: user.email,
            subject: `New HR Notice - ${announcement.noticeType} (${announcement.refNo})`,
            templateText: emailTemplate,
            variables: {
              username: userName,
              noticeType: announcement.noticeType,
              announcementText: announcement.text,
            },
            announcementId,
            userId: String(uId),
          });
        }

        // Channel 3: SMS (if mobile number exists)
        if (user.mobile) {
          await sendSMS(
            user.mobile,
            `HR ERP [${announcement.noticeType}]: ${announcement.text.substring(0, 100)}...`,
            announcementId,
            String(uId)
          );
        }

        // Channel 4: Push Notification (Mock/Stub device token)
        await sendPushNotification(
          `MOCK_TOKEN_${uId}`,
          `New HR Notice: ${announcement.noticeType}`,
          announcement.text,
          announcementId,
          String(uId)
        );
      } catch (err: unknown) {
        logger.error(`[NotificationsConsumer] Failed to dispatch notifications to user ID ${user.userId}:`, err);
        // Continue dispatching to other users in loop
      }
    }

    logger.info(`[NotificationsConsumer] Finished distributing notifications for announcement ${announcementId}`);
  } catch (err: any) {
    logger.error('[NotificationsConsumer] Failed to process message:', err);
    throw err;
  }
};

/**
 * Processes announcement synchronization
 */
const processSync = async (content: any) => {
  try {
    const data = JSON.parse(content.toString());
    const { announcementId } = data;
    logger.info(`[SyncConsumer] Processing synchronization for announcement ID: ${announcementId}`);

    // 1. Fetch Announcement
    const announcementResults = await db
      .select()
      .from(hr_announcement)
      .where(eq(hr_announcement.pk_an_id, announcementId))
      .limit(1);

    const announcement = announcementResults[0];
    if (!announcement) {
      logger.warn(`[SyncConsumer] Announcement ${announcementId} not found. Skipping sync.`);
      return;
    }

    // 2. Fetch associated files from file_metadata
    const files = await db
      .select()
      .from(file_metadata)
      .where(eq(file_metadata.announcement_id, announcementId));

    logger.info(`[SyncConsumer] Found ${files.length} files to sync to cloud storage for announcement ${announcementId}`);

    for (const file of files) {
      try {
        const filePath = path.join(process.cwd(), 'public', file.storage_path);
        const buffer = await fs.readFile(filePath);

        logger.info(`[SyncConsumer] Syncing file ${file.file_name} to cloud...`);
        await syncToCloud(announcementId, file.file_name, buffer);
      } catch (err: unknown) {
        logger.error(`[SyncConsumer] Cloud storage sync failed for file ID ${file.pk_file_id}:`, err);
      }
    }

    // 3. Sync payload to external HR system API
    try {
      const syncPayload = {
        announcement_id: announcement.pk_an_id,
        ref_no: announcement.ref_no,
        ref_date: announcement.ref_date,
        announcement_text: announcement.announcement,
        last_status: announcement.last_status,
        timestamp: new Date(),
      };

      logger.info(`[SyncConsumer] Syncing announcement ${announcementId} to external HR API...`);
      await syncToExternalHR(announcementId, syncPayload);
    } catch (err: unknown) {
      logger.error(`[SyncConsumer] External HR API sync failed for announcement ID ${announcementId}:`, err);
    }

    logger.info(`[SyncConsumer] Finished synchronization for announcement ${announcementId}`);
  } catch (err: any) {
    logger.error('[SyncConsumer] Failed to process message:', err);
    throw err;
  }
};

/**
 * Starts the announcement consumers
 */
export const startAnnouncementConsumers = async () => {
  if (notificationsConsumerTag || syncConsumerTag) {
    logger.warn('[AnnouncementConsumers] Consumers already running.');
    return;
  }

  try {
    const channel = await connectRabbitMQ();

    // Setup notifications consumer
    await channel.assertExchange(NOTIFICATIONS_EXCHANGE, 'direct', { durable: true });
    const notificationsQueueResult = await channel.assertQueue(NOTIFICATIONS_QUEUE, { durable: true });
    await channel.bindQueue(notificationsQueueResult.queue, NOTIFICATIONS_EXCHANGE, NOTIFICATIONS_ROUTING_KEY);
    await channel.prefetch(2);

    const notificationsResult = await channel.consume(
      notificationsQueueResult.queue,
      async (msg) => {
        if (!msg) {
          logger.warn('[NotificationsConsumer] Received null message');
          return;
        }

        try {
          await processNotifications(msg.content);
          channel.ack(msg);
          logger.info(`[NotificationsConsumer] Message processed and acknowledged`);
        } catch (err: any) {
          logger.error('[NotificationsConsumer] Failed to process message:', err);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );

    notificationsConsumerTag = notificationsResult.consumerTag;

    // Setup sync consumer
    await channel.assertExchange(SYNC_EXCHANGE, 'direct', { durable: true });
    const syncQueueResult = await channel.assertQueue(SYNC_QUEUE, { durable: true });
    await channel.bindQueue(syncQueueResult.queue, SYNC_EXCHANGE, SYNC_ROUTING_KEY);
    await channel.prefetch(1);

    const syncResult = await channel.consume(
      syncQueueResult.queue,
      async (msg) => {
        if (!msg) {
          logger.warn('[SyncConsumer] Received null message');
          return;
        }

        try {
          await processSync(msg.content);
          channel.ack(msg);
          logger.info(`[SyncConsumer] Message processed and acknowledged`);
        } catch (err: any) {
          logger.error('[SyncConsumer] Failed to process message:', err);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );

    syncConsumerTag = syncResult.consumerTag;

    logger.info('[AnnouncementConsumers] Consumers started successfully');
  } catch (err: any) {
    logger.error('[AnnouncementConsumers] Failed to start consumers:', err);
    throw err;
  }
};

/**
 * Stops the announcement consumers
 */
export const stopAnnouncementConsumers = async () => {
  logger.info('[AnnouncementConsumers] Stopping consumers...');

  if (notificationsConsumerTag) {
    try {
      const channel = getChannel();
      await channel.cancel(notificationsConsumerTag);
      notificationsConsumerTag = null;
      logger.info('[AnnouncementConsumers] Notifications consumer stopped');
    } catch (err: any) {
      logger.error('[AnnouncementConsumers] Error stopping notifications consumer:', err);
    }
  }

  if (syncConsumerTag) {
    try {
      const channel = getChannel();
      await channel.cancel(syncConsumerTag);
      syncConsumerTag = null;
      logger.info('[AnnouncementConsumers] Sync consumer stopped');
    } catch (err: any) {
      logger.error('[AnnouncementConsumers] Error stopping sync consumer:', err);
    }
  }
};
