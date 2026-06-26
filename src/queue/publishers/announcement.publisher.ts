// src/queue/publishers/announcement.publisher.ts
import { connectRabbitMQ, getChannel } from '../../config/rabbitmq.config.js';
import { logger } from '../../shared/utils/devHelper.js';

const NOTIFICATIONS_EXCHANGE = 'announcement-notifications-exchange';
const NOTIFICATIONS_ROUTING_KEY = 'announcement-notifications';

const SYNC_EXCHANGE = 'announcement-sync-exchange';
const SYNC_ROUTING_KEY = 'announcement-sync';

/**
 * Publishes a notification task to RabbitMQ
 */
export const publishNotificationTask = async (announcementId: number) => {
  try {
    const channel = await connectRabbitMQ();

    await channel.assertExchange(NOTIFICATIONS_EXCHANGE, 'direct', { durable: true });

    const content = Buffer.from(JSON.stringify({ announcementId }));
    channel.publish(NOTIFICATIONS_EXCHANGE, NOTIFICATIONS_ROUTING_KEY, content, {
      persistent: true,
      contentType: 'application/json',
    });

    logger.info(`[NotificationPublisher] Published notification task for announcement ${announcementId}`);
  } catch (err: any) {
    logger.error('[NotificationPublisher] Failed to publish notification task:', err);
    throw err;
  }
};

/**
 * Publishes a sync task to RabbitMQ
 */
export const publishSyncTask = async (announcementId: number) => {
  try {
    const channel = await connectRabbitMQ();

    await channel.assertExchange(SYNC_EXCHANGE, 'direct', { durable: true });

    const content = Buffer.from(JSON.stringify({ announcementId }));
    channel.publish(SYNC_EXCHANGE, SYNC_ROUTING_KEY, content, {
      persistent: true,
      contentType: 'application/json',
    });

    logger.info(`[SyncPublisher] Published sync task for announcement ${announcementId}`);
  } catch (err: any) {
    logger.error('[SyncPublisher] Failed to publish sync task:', err);
    throw err;
  }
};

/**
 * Schedules a notification task at a specific time using TTL + DLX
 */
export const scheduleNotificationTask = async (announcementId: number, scheduledAt: Date) => {
  const delay = scheduledAt.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error(`scheduled_at must be in the future (delay was ${delay}ms)`);
  }

  try {
    const channel = await connectRabbitMQ();

    const delayExchange = 'notification-delay-exchange';
    const delayQueue = 'notification-delay-queue';
    const targetExchange = NOTIFICATIONS_EXCHANGE;
    const targetRoutingKey = NOTIFICATIONS_ROUTING_KEY;

    await channel.assertExchange(delayExchange, 'direct', { durable: true });

    const delayQueueArgs = {
      'x-message-ttl': delay,
      'x-dead-letter-exchange': targetExchange,
      'x-dead-letter-routing-key': targetRoutingKey,
    };

    await channel.assertQueue(delayQueue, {
      durable: true,
      arguments: delayQueueArgs,
    });

    await channel.bindQueue(delayQueue, delayExchange, NOTIFICATIONS_ROUTING_KEY);

    const content = Buffer.from(JSON.stringify({ announcementId }));
    channel.publish(delayExchange, NOTIFICATIONS_ROUTING_KEY, content, {
      persistent: true,
      contentType: 'application/json',
    });

    logger.info(
      `[NotificationPublisher] Scheduled notification task in ${Math.round(delay / 1000)}s`
    );
  } catch (err: any) {
    logger.error('[NotificationPublisher] Failed to schedule notification task:', err);
    throw err;
  }
};
