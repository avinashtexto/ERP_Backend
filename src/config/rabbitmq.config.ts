// src/config/rabbitmq.config.ts
import amqp from 'amqplib';
import { logger } from '../shared/utils/devHelper.js';

const getRabbitMQUrl = () => {
  return process.env.RABBITMQ_URL || 'amqp://localhost:5672';
};

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

/**
 * Establishes connection to RabbitMQ and creates a channel
 */
export const connectRabbitMQ = async (): Promise<amqp.Channel> => {
  if (channel) {
    return channel;
  }

  try {
    const url = getRabbitMQUrl();
    logger.info(`[RabbitMQ] Connecting to ${url}`);

    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    if (channel) {
      channel.on('error', (err: Error) => {
        logger.error('[RabbitMQ] Channel error:', err);
      });
    }

    if (connection) {
      connection.on('error', (err: Error) => {
        logger.error('[RabbitMQ] Connection error:', err);
      });

      connection.on('close', () => {
        logger.warn('[RabbitMQ] Connection closed');
        channel = null;
        connection = null;
      });
    }

    logger.info('[RabbitMQ] Connected successfully');
    return channel as amqp.Channel;
  } catch (err: any) {
    logger.error('[RabbitMQ] Failed to connect:', err);
    throw err;
  }
};

/**
 * Closes RabbitMQ connection gracefully
 */
export const closeRabbitMQ = async () => {
  logger.info('[RabbitMQ] Closing connection...');

  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }

  logger.info('[RabbitMQ] Connection closed');
};

/**
 * Gets the active channel (throws if not connected)
 */
export const getChannel = (): amqp.Channel => {
  if (!channel) {
    throw new Error('[RabbitMQ] Not connected. Call connectRabbitMQ() first.');
  }
  return channel;
};
