// shared/utils/file-logger.ts
import fs from 'fs';
import path from 'path';

import { getFormattedDate } from './logger-utils.js';

const LOGS_DIR = path.resolve(process.cwd(), 'src/log');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export function writeLogToFile(logType: 'api' | 'activity', message: string): void {
  try {
    const filename = `${getFormattedDate()}-${logType}.log`;
    fs.appendFileSync(path.join(LOGS_DIR, filename), message + '\n', 'utf8');
  } catch (error) {
    console.error('[FileLogger Error] Failed to write to log file:', error);
  }
}
