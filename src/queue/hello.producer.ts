import { Queue } from 'bullmq';
import { queueConnectionOptions } from '../config/queue.config.js';
import { logger } from '../shared/utils/devHelper.js';

export const helloQueue = new Queue('hello-tasks', {
  connection: queueConnectionOptions,
});

helloQueue.on('error', (err) => {
  logger.error('[HelloQueue] error:', err);
});

/**
 * Schedules a hello message at a specific time
 */
export const scheduleHelloMessage = async (message: string, scheduledAt: Date) => {
  const delay = scheduledAt.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error(`scheduled_at must be in the future (delay was ${delay}ms)`);
  }

  try {
    const job = await helloQueue.add(
      'hello-message',
      { message },
      {
        delay,
        removeOnComplete: true,
        removeOnFail: { age: 3600 },
      }
    );

    logger.info(
      `[HelloQueue] Scheduled message in ${Math.round(delay / 1000)}s (job: ${job.id})`
    );

    return job;
  } catch (err: unknown) {
    logger.error(`[HelloQueue] Failed to schedule message:`, err);
    throw err;
  }
};
