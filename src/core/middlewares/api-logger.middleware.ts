import type { Request, Response, NextFunction } from 'express';

import { logger } from '../../shared/utils/devHelper.js';
import { writeLogToFile } from '../../shared/utils/file-logger.js';

function getFormattedTime(): string {
  return new Date().toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function apiLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    try {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

      const logLine =
        `[${getFormattedTime()}] ` +
        `${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ${durationMs.toFixed(2)}ms`;

      writeLogToFile('api', logLine);

      const message =
        `${req.method} ${req.originalUrl} ` + `${res.statusCode} - ${durationMs.toFixed(2)}ms`;

      if (res.statusCode >= 500) {
        logger.error(message);
      } else if (res.statusCode >= 400) {
        logger.warn(message);
      } else {
        logger.success(message);
      }
    } catch (error) {
      logger.error(`API Logger Error: ${error}`);
    }
  });

  next();
}
