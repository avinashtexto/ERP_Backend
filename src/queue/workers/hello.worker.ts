import { Worker, type Job } from 'bullmq';
import { queueConnectionOptions } from '../../config/queue.config.js';
import { logger } from '../../shared/utils/devHelper.js';

/**
 * Worker processor for hello task
 */
export const processHello = async (job: Job) => {
  const { message } = job.data;
  logger.info(`[HelloWorker] ${message}`);
  console.log(message);
};

let helloWorkerInstance: Worker | null = null;

/**
 * Initializes and starts the hello worker
 */
export const startHelloWorker = () => {
  if (helloWorkerInstance) {
    logger.warn('[HelloWorker] Worker already running.');
    return;
  }

  logger.info('[HelloWorker] Initializing hello worker...');

  helloWorkerInstance = new Worker('hello-tasks', processHello, {
    connection: queueConnectionOptions,
    concurrency: 1,
  });

  helloWorkerInstance.on('error', (err) => {
    logger.error('[HelloWorker] error:', err);
  });

  helloWorkerInstance.on('completed', (job) => {
    logger.info(`[HelloWorker] Job ${job.id} completed successfully.`);
  });

  helloWorkerInstance.on('failed', (job, err) => {
    logger.error(`[HelloWorker] Job ${job?.id} failed:`, err);
  });

  logger.info('[HelloWorker] Worker started successfully.');
};

/**
 * Gracefully shuts down the hello worker
 */
export const stopHelloWorker = async () => {
  logger.info('[HelloWorker] Stopping worker...');

  if (helloWorkerInstance) {
    await helloWorkerInstance.close();
    helloWorkerInstance = null;
  }

  logger.info('[HelloWorker] Worker stopped.');
};
