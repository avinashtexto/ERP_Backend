// src/queue/workers/announcement.worker.ts
import { Worker, type Job } from 'bullmq';
import { db } from '../../config/db.config.js';
import { queueConnectionOptions } from '../../config/queue.config.js';
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

/**
 * Worker processor for distributing announcement notifications
 */
export const processNotifications = async (job: Job) => {
  const { announcementId } = job.data;
  logger.info(`[NotificationsWorker] Processing notifications for announcement ID: ${announcementId}`);

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
    logger.warn(`[NotificationsWorker] Announcement ${announcementId} not found. Skipping notifications.`);
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

  logger.info(`[NotificationsWorker] Found ${targetUsers.length} target users for announcement ${announcementId}`);

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

      logger.info(`[NotificationsWorker] Sending notifications to ${userName} (ID: ${uId})...`);

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
      logger.error(`[NotificationsWorker] Failed to dispatch notifications to user ID ${user.userId}:`, err);
      // Continue dispatching to other users in loop
    }
  }

  logger.info(`[NotificationsWorker] Finished distributing notifications for announcement ${announcementId}`);
};

/**
 * Worker processor for cloud storage and external HR systems synchronization
 */
export const processSync = async (job: Job) => {
  const { announcementId } = job.data;
  logger.info(`[SyncWorker] Processing synchronization for announcement ID: ${announcementId}`);

  // 1. Fetch Announcement
  const announcementResults = await db
    .select()
    .from(hr_announcement)
    .where(eq(hr_announcement.pk_an_id, announcementId))
    .limit(1);

  const announcement = announcementResults[0];
  if (!announcement) {
    logger.warn(`[SyncWorker] Announcement ${announcementId} not found. Skipping sync.`);
    return;
  }

  // 2. Fetch associated files from file_metadata
  const files = await db
    .select()
    .from(file_metadata)
    .where(eq(file_metadata.announcement_id, announcementId));

  logger.info(`[SyncWorker] Found ${files.length} files to sync to cloud storage for announcement ${announcementId}`);

  for (const file of files) {
    try {
      const filePath = path.join(process.cwd(), 'public', file.storage_path);
      const buffer = await fs.readFile(filePath);

      logger.info(`[SyncWorker] Syncing file ${file.file_name} to cloud...`);
      await syncToCloud(announcementId, file.file_name, buffer);
    } catch (err: unknown) {
      logger.error(`[SyncWorker] Cloud storage sync failed for file ID ${file.pk_file_id}:`, err);
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

    logger.info(`[SyncWorker] Syncing announcement ${announcementId} to external HR API...`);
    await syncToExternalHR(announcementId, syncPayload);
  } catch (err: unknown) {
    logger.error(`[SyncWorker] External HR API sync failed for announcement ID ${announcementId}:`, err);
  }

  logger.info(`[SyncWorker] Finished synchronization for announcement ${announcementId}`);
};

// Module-level flags: log the Redis offline warning only once per worker, ever.
let notificationsWorkerWarnedOnce = false;
let syncWorkerWarnedOnce = false;

const isConnectionRefused = (err: unknown): boolean => {
  if (err && typeof err === 'object' && 'code' in err) {
    return (err as NodeJS.ErrnoException).code === 'ECONNREFUSED';
  }
  return String(err).includes('ECONNREFUSED');
};

// Workers variables to hold active instances
let notificationsWorkerInstance: Worker | null = null;
let syncWorkerInstance: Worker | null = null;

/**
 * Initializes and starts all background queue worker instances
 */
export const startWorkers = () => {
  if (notificationsWorkerInstance || syncWorkerInstance) {
    logger.warn('[QueueWorkers] Workers already running.');
    return;
  }

  logger.info('[QueueWorkers] Initializing background workers...');

  notificationsWorkerInstance = new Worker('announcement-notifications', processNotifications, {
    connection: queueConnectionOptions,
    concurrency: 2,
  });

  syncWorkerInstance = new Worker('announcement-sync', processSync, {
    connection: queueConnectionOptions,
    concurrency: 1,
  });

  notificationsWorkerInstance.on('error', (err) => {
    if (isConnectionRefused(err)) {
      if (!notificationsWorkerWarnedOnce) {
        notificationsWorkerWarnedOnce = true;
        logger.warn('[QueueWorkers] notificationsWorker: Redis unavailable. Worker will retry when Redis is online.');
      }
      return;
    }
    logger.error('[QueueWorkers] notificationsWorker error:', err);
  });

  syncWorkerInstance.on('error', (err) => {
    if (isConnectionRefused(err)) {
      if (!syncWorkerWarnedOnce) {
        syncWorkerWarnedOnce = true;
        logger.warn('[QueueWorkers] syncWorker: Redis unavailable. Worker will retry when Redis is online.');
      }
      return;
    }
    logger.error('[QueueWorkers] syncWorker error:', err);
  });

  notificationsWorkerInstance.on('completed', (job) => {
    logger.info(`[QueueWorkers] Notifications job ${job.id} completed successfully.`);
  });

  notificationsWorkerInstance.on('failed', (job, err) => {
    logger.error(`[QueueWorkers] Notifications job ${job?.id} failed:`, err);
  });

  syncWorkerInstance.on('completed', (job) => {
    logger.info(`[QueueWorkers] Sync job ${job.id} completed successfully.`);
  });

  syncWorkerInstance.on('failed', (job, err) => {
    logger.error(`[QueueWorkers] Sync job ${job?.id} failed:`, err);
  });

  logger.info('[QueueWorkers] Workers started successfully.');
};

/**
 * Gracefully shuts down all running workers
 */
export const stopWorkers = async () => {
  logger.info('[QueueWorkers] Stopping background workers...');

  if (notificationsWorkerInstance) {
    await notificationsWorkerInstance.close();
    notificationsWorkerInstance = null;
  }

  if (syncWorkerInstance) {
    await syncWorkerInstance.close();
    syncWorkerInstance = null;
  }

  logger.info('[QueueWorkers] Workers stopped.');
};
