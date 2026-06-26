// src/queue/queue.producer.ts
import { Queue } from 'bullmq';
import { queueConnectionOptions } from '../config/queue.config.js';
import { logger } from '../shared/utils/devHelper.js';

// Initialize BullMQ Queues
export const notificationsQueue = new Queue('announcement-notifications', {
  connection: queueConnectionOptions,
});

export const syncQueue = new Queue('announcement-sync', {
  connection: queueConnectionOptions,
});

// Module-level flags: log the Redis offline warning only once per queue, ever.
let notificationsQueueWarnedOnce = false;
let syncQueueWarnedOnce = false;

const isConnectionRefused = (err: unknown): boolean => {
  if (err && typeof err === 'object' && 'code' in err) {
    return (err as NodeJS.ErrnoException).code === 'ECONNREFUSED';
  }
  return String(err).includes('ECONNREFUSED');
};

notificationsQueue.on('error', (err) => {
  if (isConnectionRefused(err)) {
    if (!notificationsQueueWarnedOnce) {
      notificationsQueueWarnedOnce = true;
      logger.warn('[QueueProducer] notificationsQueue: Redis unavailable. Queue will retry when Redis is online.');
    }
    return;
  }
  logger.error('[QueueProducer] notificationsQueue error:', err);
});

syncQueue.on('error', (err) => {
  if (isConnectionRefused(err)) {
    if (!syncQueueWarnedOnce) {
      syncQueueWarnedOnce = true;
      logger.warn('[QueueProducer] syncQueue: Redis unavailable. Queue will retry when Redis is online.');
    }
    return;
  }
  logger.error('[QueueProducer] syncQueue error:', err);
});

// ─────────────────────────────────────────────────────────────────
// Immediate dispatch (used by authorizeAnnouncement)
// ─────────────────────────────────────────────────────────────────

/**
 * Queues announcement notification distribution to target employees (immediate).
 */
export const queueAnnouncementNotifications = async (announcementId: number) => {
  try {
    const job = await notificationsQueue.add(
      'broadcast-notifications',
      { announcementId },
      {
        removeOnComplete: true,
        removeOnFail: { age: 24 * 3600 },
      }
    );
    logger.info(`[QueueProducer] Enqueued notifications job ${job.id} for announcement ${announcementId}`);
    return job;
  } catch (err: unknown) {
    logger.error(`[QueueProducer] Failed to enqueue notifications for announcement ${announcementId}:`, err);
    throw err;
  }
};

/**
 * Queues announcement cloud and external HR API synchronization (immediate).
 */
export const queueAnnouncementSync = async (announcementId: number) => {
  try {
    const job = await syncQueue.add(
      'sync-external',
      { announcementId },
      {
        removeOnComplete: true,
        removeOnFail: { age: 24 * 3600 },
      }
    );
    logger.info(`[QueueProducer] Enqueued sync job ${job.id} for announcement ${announcementId}`);
    return job;
  } catch (err: unknown) {
    logger.error(`[QueueProducer] Failed to enqueue sync for announcement ${announcementId}:`, err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────
// Delayed (scheduled) dispatch
// ─────────────────────────────────────────────────────────────────

/**
 * Builds a deterministic BullMQ jobId for a scheduled announcement.
 * Using a fixed jobId ensures re-scheduling replaces the previous delayed job.
 */
const scheduledJobId = (announcementId: number, queue: 'notif' | 'sync') =>
  `scheduled:${queue}:${announcementId}`;

/**
 * Enqueues both notification and sync jobs as BullMQ delayed jobs.
 * If a job with the same jobId already exists (i.e. re-schedule), BullMQ
 * removes the old job and adds the new one with the updated delay.
 * @param announcementId  The announcement to dispatch.
 * @param scheduledAt     The future Date at which to fire.
 */
export const scheduleAnnouncementDispatch = async (
  announcementId: number,
  scheduledAt: Date
) => {
  const delay = scheduledAt.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error(`scheduled_at must be in the future (delay was ${delay}ms)`);
  }

  const notifJobId = scheduledJobId(announcementId, 'notif');
  const syncJobId = scheduledJobId(announcementId, 'sync');

  // Remove old scheduled jobs for this announcement if they exist
  await cancelScheduledDispatch(announcementId);

  try {
    const notifJob = await notificationsQueue.add(
      'broadcast-notifications',
      { announcementId },
      {
        delay,
        jobId: notifJobId,
        removeOnComplete: true,
        removeOnFail: { age: 24 * 3600 },
      }
    );

    const syncJob = await syncQueue.add(
      'sync-external',
      { announcementId },
      {
        delay,
        jobId: syncJobId,
        removeOnComplete: true,
        removeOnFail: { age: 24 * 3600 },
      }
    );

    logger.info(
      `[QueueProducer] Scheduled announcement ${announcementId} dispatch in ${Math.round(delay / 1000)}s` +
        ` (notif job: ${notifJob.id}, sync job: ${syncJob.id})`
    );

    return { notifJob, syncJob };
  } catch (err: unknown) {
    logger.error(
      `[QueueProducer] Failed to schedule announcement ${announcementId} dispatch:`,
      err
    );
    throw err;
  }
};

/**
 * Removes the pending delayed jobs for a scheduled announcement.
 * Safe to call even if jobs do not exist (no-op in that case).
 */
export const cancelScheduledDispatch = async (announcementId: number) => {
  try {
    const notifJob = await notificationsQueue.getJob(scheduledJobId(announcementId, 'notif'));
    const syncJob = await syncQueue.getJob(scheduledJobId(announcementId, 'sync'));

    if (notifJob) {
      await notifJob.remove();
      logger.info(`[QueueProducer] Removed scheduled notifications job for announcement ${announcementId}`);
    }

    if (syncJob) {
      await syncJob.remove();
      logger.info(`[QueueProducer] Removed scheduled sync job for announcement ${announcementId}`);
    }
  } catch (err: unknown) {
    // Non-fatal: log and continue
    logger.warn(`[QueueProducer] Could not remove scheduled jobs for announcement ${announcementId}:`, err);
  }
};
