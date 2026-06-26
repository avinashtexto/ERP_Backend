// src/queue/consumers/hello.consumer.ts
import { connectRabbitMQ, getChannel } from '../../config/rabbitmq.config.js';
import { logger } from '../../shared/utils/devHelper.js';

const QUEUE_NAME = 'hello-tasks';
const EXCHANGE_NAME = 'hello-exchange';
const ROUTING_KEY = 'hello-message';

let consumerTag: string | null = null;

/**
 * Processes a hello message
 */
const processHelloMessage = async (content: any) => {
  try {
    const data = JSON.parse(content.toString());
    const { message } = data;
    logger.info(`[HelloConsumer] ${message}`);
    console.log(message);
  } catch (err: any) {
    logger.error('[HelloConsumer] Failed to parse message:', err);
    throw err;
  }
};

/**
 * Starts the hello consumer
 */
export const startHelloConsumer = async () => {
  if (consumerTag) {
    logger.warn('[HelloConsumer] Consumer already running.');
    return;
  }

  try {
    const channel = await connectRabbitMQ();

    // Assert exchange
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    // Assert queue
    const queueResult = await channel.assertQueue(QUEUE_NAME, { durable: true });
    logger.info(`[HelloConsumer] Queue asserted: ${queueResult.queue}`);

    // Bind queue to exchange
    await channel.bindQueue(queueResult.queue, EXCHANGE_NAME, ROUTING_KEY);
    logger.info(`[HelloConsumer] Queue bound to exchange`);

    // Set prefetch
    await channel.prefetch(1);

    // Check queue message count
    const queueInfo = await channel.checkQueue(queueResult.queue);
    logger.info(`[HelloConsumer] Queue message count: ${queueInfo.messageCount}`);

    // Consume messages
    const result = await channel.consume(
      queueResult.queue,
      async (msg) => {
        logger.info('[HelloConsumer] Message received!');
        if (!msg) {
          logger.warn('[HelloConsumer] Received null message');
          return;
        }

        try {
          await processHelloMessage(msg.content);
          channel.ack(msg);
          logger.info(`[HelloConsumer] Message processed and acknowledged`);
        } catch (err: any) {
          logger.error('[HelloConsumer] Failed to process message:', err);
          channel.nack(msg, false, false); // Don't requeue on error
        }
      },
      { noAck: false }
    );

    consumerTag = result.consumerTag;

    logger.info('[HelloConsumer] Consumer started successfully');
  } catch (err: any) {
    logger.error('[HelloConsumer] Failed to start consumer:', err);
    throw err;
  }
};

/**
 * Stops the hello consumer
 */
export const stopHelloConsumer = async () => {
  logger.info('[HelloConsumer] Stopping consumer...');

  if (consumerTag) {
    try {
      const channel = getChannel();
      await channel.cancel(consumerTag);
      consumerTag = null;
      logger.info('[HelloConsumer] Consumer stopped');
    } catch (err: any) {
      logger.error('[HelloConsumer] Error stopping consumer:', err);
    }
  }
};
