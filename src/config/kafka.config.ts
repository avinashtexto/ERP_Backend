import { Kafka } from 'kafkajs';
import type { Producer, Consumer } from 'kafkajs';

import { logger } from '../shared/utils/devHelper.js';

const brokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(',')
  : ['localhost:9092'];
const clientId = process.env.KAFKA_CLIENT_ID || 'tionix-erp-backend';

export const kafka = new Kafka({
  clientId,
  brokers,
});

export let producer: Producer | null = null;
export let consumer: Consumer | null = null;

export async function connectKafka(): Promise<void> {
  if (process.env.ENABLE_KAFKA !== 'true') {
    logger.warn(
      'Kafka integration is disabled (set ENABLE_KAFKA=true in environment to enable). Skipping connection.',
    );
    return;
  }
  try {
    logger.info('Initializing Kafka integration...');

    // 1. Initialize Producer
    producer = kafka.producer();
    await producer.connect();
    logger.info('Kafka Producer connected successfully.');

    // 2. Initialize Logging Consumer (Standard demo subscriber)
    consumer = kafka.consumer({ groupId: `${clientId}-default-group` });
    await consumer.connect();
    await consumer.subscribe({ topic: 'tionix-erp-events', fromBeginning: false });

    // Start polling consumer loops
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value ? message.value.toString() : '';
        logger.info(`📬 Received event [Topic: ${topic}] [Partition: ${partition}]: ${value}`);
      },
    });
    logger.info(`Kafka Consumer listening on topic 'tionix-erp-events'`);
  } catch (error) {
    logger.error('Failed to initialize Kafka connection:', error);
    // Do not crash the application if Kafka broker is unavailable
  }
}

export async function disconnectKafka(): Promise<void> {
  try {
    if (producer) {
      logger.info('Disconnecting Kafka Producer...');
      await producer.disconnect();
    }
    if (consumer) {
      logger.info('Disconnecting Kafka Consumer...');
      await consumer.disconnect();
    }
    logger.info('Kafka resources disconnected successfully.');
  } catch (error) {
    logger.error('Error disconnecting Kafka resources:', error);
  }
}

export async function publishEvent(topic: string, payload: any): Promise<boolean> {
  if (!producer) {
    logger.error(`Kafka Producer is not connected. Cannot publish message to topic '${topic}'`);
    return false;
  }
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: payload.id ? String(payload.id) : null,
          value: JSON.stringify(payload),
          timestamp: String(Date.now()),
        },
      ],
    });
    logger.info(`Published Kafka message to topic '${topic}'`);
    return true;
  } catch (error) {
    logger.error(`Failed to publish message to topic '${topic}':`, error);
    return false;
  }
}
