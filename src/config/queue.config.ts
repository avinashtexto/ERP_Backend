// src/config/queue.config.ts
import { logger } from '../shared/utils/devHelper.js';

const getRedisOptions = () => {
  const urlStr = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    const parsed = new URL(urlStr);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 6379,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      maxRetriesPerRequest: null, // Critical option for BullMQ workers to prevent crashing on connection drops
    };
  } catch (err: any) {
    logger.error(`[QueueConfig] Invalid REDIS_URL configuration: ${urlStr}. Falling back to default localhost connection.`, err);
    return {
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
};

export const queueConnectionOptions = getRedisOptions();
