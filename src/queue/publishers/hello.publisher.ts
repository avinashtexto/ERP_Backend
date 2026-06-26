// src/queue/publishers/hello.publisher.ts
import { connectRabbitMQ, getChannel } from '../../config/rabbitmq.config.js';
import { logger } from '../../shared/utils/devHelper.js';

const EXCHANGE_NAME = 'hello-exchange';
const ROUTING_KEY = 'hello-message';

/**
 * Publishes a hello message to RabbitMQ
 */
export const publishHelloMessage = async (message: string) => {
  try {
    const channel = await connectRabbitMQ();

    // Assert exchange
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    // Publish message
    const content = Buffer.from(JSON.stringify({ message }));
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, content, {
      persistent: true,
      contentType: 'application/json',
    });

    logger.info(`[HelloPublisher] Published message: ${message}`);
  } catch (err: any) {
    logger.error('[HelloPublisher] Failed to publish message:', err);
    throw err;
  }
};

/**
 * Schedules a hello message at a specific time using delayed message exchange
 * Note: RabbitMQ doesn't natively support delayed messages without a plugin.
 * This implementation uses TTL + dead-letter exchange for delayed delivery.
 */
export const scheduleHelloMessage = async (message: string, scheduledAt: Date) => {
  const delay = scheduledAt.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error(`scheduled_at must be in the future (delay was ${delay}ms)`);
  }

  try {
    const channel = await connectRabbitMQ();

    const delayExchange = 'hello-delay-exchange';
    const delayQueue = 'hello-delay-queue';
    const targetExchange = EXCHANGE_NAME;
    const targetRoutingKey = ROUTING_KEY;

    // Assert delayed exchange
    await channel.assertExchange(delayExchange, 'direct', { durable: true });

    // Delete existing delay queue if it exists to avoid TTL conflicts
    try {
      await channel.deleteQueue(delayQueue);
    } catch (err: any) {
      // Queue might not exist, ignore error
    }

    // Assert delay queue with TTL
    const delayQueueArgs = {
      'x-message-ttl': delay,
      'x-dead-letter-exchange': targetExchange,
      'x-dead-letter-routing-key': targetRoutingKey,
    };

    await channel.assertQueue(delayQueue, {
      durable: true,
      arguments: delayQueueArgs,
    });

    // Bind delay queue to delay exchange
    await channel.bindQueue(delayQueue, delayExchange, ROUTING_KEY);

    // Publish to delay exchange
    const content = Buffer.from(JSON.stringify({ message }));
    channel.publish(delayExchange, ROUTING_KEY, content, {
      persistent: true,
      contentType: 'application/json',
    });

    logger.info(
      `[HelloPublisher] Scheduled message in ${Math.round(delay / 1000)}s`
    );
  } catch (err: any) {
    logger.error('[HelloPublisher] Failed to schedule message:', err);
    throw err;
  }
};
