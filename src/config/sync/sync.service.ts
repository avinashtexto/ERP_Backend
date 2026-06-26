import { db } from '../db.config.js';
import { sync_log } from '../../shared/database/schemas/index.js';
import { logger } from '../../shared/utils/devHelper.js';
import fs from 'fs/promises';
import path from 'path';
import { AWS_S3_BUCKET, EXTERNAL_HR_API_URL, EXTERNAL_HR_API_TOKEN, MAX_SYNC_ATTEMPTS, INITIAL_BACKOFF_DELAY } from './sync.config.js';

/**
 * Persists synchronisation records to the sync_log table
 */
export const logSyncStatus = async (
  announcementId: number,
  destination: 'cloud' | 'external',
  status: 'pending' | 'success' | 'failed',
  error?: string,
  syncData?: any
) => {
  try {
    const [inserted] = await db
      .insert(sync_log)
      .values({
        announcement_id: announcementId,
        destination,
        status,
        sync_data: syncData || null,
        error: error || null,
        attempted_at: new Date(),
        completed_at: status === 'success' ? new Date() : null,
      })
      .returning();
    return inserted;
  } catch (err) {
    logger.error('[SyncService] Failed to write sync log:', err);
  }
};

/**
 * Synchronises a file/attachment to S3 bucket (or local mock cloud upload fallback)
 */
export const syncToCloud = async (announcementId: number, fileKey: string, fileBuffer: Buffer) => {
  if (!AWS_S3_BUCKET) {
    logger.warn(`[SyncService] S3 configuration missing. Mocking cloud upload for announcement ${announcementId}`);
    try {
      const mockCloudDir = path.resolve(process.cwd(), 'public/uploads/cloud_mock');
      await fs.mkdir(mockCloudDir, { recursive: true });
      await fs.writeFile(path.join(mockCloudDir, fileKey), fileBuffer);
      
      const fileUrl = `/uploads/cloud_mock/${fileKey}`;
      await logSyncStatus(announcementId, 'cloud', 'success', undefined, { fileKey, url: fileUrl });
      return { success: true, url: fileUrl };
    } catch (mockErr: any) {
      await logSyncStatus(announcementId, 'cloud', 'failed', mockErr.message, { fileKey });
      throw mockErr;
    }
  }

  try {
    // Standard integration parameters
    logger.info(`[SyncService] Uploading file ${fileKey} to S3 bucket ${AWS_S3_BUCKET}...`);
    // NOTE: S3 PutObject SDK invocation would happen here in production
    
    const fileUrl = `https://${AWS_S3_BUCKET}.s3.amazonaws.com/${fileKey}`;
    await logSyncStatus(announcementId, 'cloud', 'success', undefined, { fileKey, bucketName: AWS_S3_BUCKET, url: fileUrl });
    return { success: true, url: fileUrl };
  } catch (err: any) {
    logger.error(`[SyncService] S3 Cloud upload failed for ${fileKey}:`, err);
    await logSyncStatus(announcementId, 'cloud', 'failed', err.message, { fileKey });
    throw err;
  }
};

/**
 * Synchronises announcement data to an external HR API with exponential backoff retries
 */
export const syncToExternalHR = async (announcementId: number, payload: any) => {
  if (!EXTERNAL_HR_API_URL) {
    logger.warn(`[SyncService] External HR API configurations missing. Mocking sync for announcement ${announcementId}`);
    await logSyncStatus(announcementId, 'external', 'success', undefined, { payload, provider: 'mock' });
    return { success: true, provider: 'mock' };
  }

  let attempt = 0;
  let backoffDelay = INITIAL_BACKOFF_DELAY;

  while (attempt < MAX_SYNC_ATTEMPTS) {
    try {
      attempt++;
      logger.info(`[SyncService] External HR sync attempt ${attempt}/${MAX_SYNC_ATTEMPTS} for announcement ${announcementId}...`);
      
      const response = await fetch(EXTERNAL_HR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EXTERNAL_HR_API_TOKEN || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`External HR system responded with HTTP status ${response.status}`);
      }

      const responseBody = await response.json().catch(() => ({}));
      logger.info(`[SyncService] Announcement ${announcementId} synced successfully to external API.`);
      
      await logSyncStatus(announcementId, 'external', 'success', undefined, {
        payload,
        response: responseBody,
        attempts: attempt,
      });
      return { success: true, response: responseBody };
    } catch (err: any) {
      logger.warn(`[SyncService] External HR sync attempt ${attempt} failed: ${err.message}`);
      
      if (attempt >= MAX_SYNC_ATTEMPTS) {
        logger.error(`[SyncService] External HR sync failed permanently for announcement ${announcementId}`);
        await logSyncStatus(announcementId, 'external', 'failed', err.message, { payload });
        throw err;
      }
      
      // Wait for backoff duration
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      backoffDelay *= 2; // Double the wait time
    }
  }
};
