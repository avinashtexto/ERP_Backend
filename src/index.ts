import './load-env.js';
import http from 'http';

import app from './app.js';
import { db } from './config/db.config.js';
import { connectKafka, disconnectKafka } from './config/kafka.config.js';
import { startWorkers, stopWorkers } from './queue/workers/announcement.worker.js';
import { startHelloWorker, stopHelloWorker } from './queue/workers/hello.worker.js';
import { logger } from './shared/utils/devHelper.js';

/* ---------------------------------- */
/* CONFIG CONFIGURATION */
/* ---------------------------------- */

const PORT = Number(process.env.PORT) || 4100;
let isShuttingDown = false;

/* ---------------------------------- */
/* CORE BOOTSTRAPPER METHOD */
/* ---------------------------------- */

async function bootstrap() {
  // Test database connection
  try {
    await db.execute('SELECT 1');
    logger.info('Database connected successfully.');
  } catch (error: any) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }

  // Connect Kafka
  await connectKafka();

  // Start background queue workers
  startWorkers();
  startHelloWorker();

  const server = http.createServer(app);

  server.listen(PORT, '0.0.0.0');

  server.on('listening', () => {
    logger.banner(`Server Running: http://localhost:${PORT}`);
    logger.banner(`Scalar Docs : http://localhost:${PORT}/api/docs`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error('Port already in use', { port: PORT });
    } else {
      logger.error('Server startup error', error);
    }
    process.exit(1);
  });

  process.on('SIGINT', () => shutdown(server, 'SIGINT'));
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
    shutdown(server, 'unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    shutdown(server, 'uncaughtException');
  });
}

/* ---------------------------------- */
/* SHUTDOWN IMPLEMENTATION */
/* ---------------------------------- */

async function shutdown(server: http.Server, signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn(`\n🛑 Received ${signal}. Initializing graceful shutdown...`);

  const timeout = setTimeout(() => {
    logger.error('Force shutdown after timeout');
    process.exit(1);
  }, 10000);
  timeout.unref();

  // Stop accepting new HTTP requests first
  server.close(async (err) => {
    clearTimeout(timeout);

    if (err) {
      logger.error('Error during HTTP server shutdown', err);
    } else {
      logger.info('Express HTTP server closed.');
    }

    try {
      // Stop background queue workers
      await stopWorkers();
      await stopHelloWorker();

      // Disconnect Kafka resources
      await disconnectKafka();

      logger.info('Closing primary database directory pool...');
      if (db.$client && typeof db.$client.end === 'function') {
        await db.$client.end();
      }

      logger.info('Primary database connection pool terminated.');
      logger.info('Goodbye!');
      process.exit(0);
    } catch (shutdownError) {
      logger.error('Error while closing database resources:', shutdownError);
      process.exit(1);
    }
  });
}

bootstrap();

