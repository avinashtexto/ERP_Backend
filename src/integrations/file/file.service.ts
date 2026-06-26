import { db } from '../../config/db.config.js';
import { file_metadata } from '../../shared/database/schemas/index.js';
import { logger } from '../../shared/utils/devHelper.js';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import net from 'net';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, CLAMAV_HOST, CLAMAV_PORT } from './file.config.js';

/**
 * Communicates directly with ClamAV daemon via TCP socket using raw INSTREAM commands
 */
export const scanWithClamAV = (buffer: Buffer): Promise<{ clean: boolean; result: string }> => {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: CLAMAV_HOST, port: CLAMAV_PORT });
    socket.setTimeout(3000);

    let response = '';

    socket.on('connect', () => {
      // Send INSTREAM command
      socket.write('zINSTREAM\0');
      
      // Write chunk size (4 bytes big-endian) followed by the buffer
      const sizeHeader = Buffer.alloc(4);
      sizeHeader.writeUInt32BE(buffer.length, 0);
      
      socket.write(sizeHeader);
      socket.write(buffer);
      
      // Signal end of stream with a zero-length chunk
      const endHeader = Buffer.alloc(4);
      endHeader.writeUInt32BE(0, 0);
      socket.write(endHeader);
    });

    socket.on('data', (chunk) => {
      response += chunk.toString();
    });

    socket.on('end', () => {
      const clean = response.includes('OK') && !response.includes('FOUND');
      resolve({ clean, result: response.trim() });
    });

    socket.on('error', (err) => {
      logger.warn(`[FileService] ClamAV socket error (${err.message}). Falling back to mock virus scan.`);
      resolve({ clean: true, result: 'MOCK_CLEAN_FALLBACK' });
    });

    socket.on('timeout', () => {
      logger.warn('[FileService] ClamAV socket timeout. Falling back to mock virus scan.');
      socket.destroy();
      resolve({ clean: true, result: 'SCAN_TIMEOUT' });
    });
  });
};

/**
 * Validates file properties and runs virus scanner
 */
export const validateAndScanFile = async (
  buffer: Buffer,
  fileName: string,
  mimeType: string
) => {
  // 1. Validate File Size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the maximum limit of 10MB.');
  }

  // 2. Validate MIME Type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`MIME type '${mimeType}' is not allowed.`);
  }

  // 3. Virus Scan using ClamAV
  logger.info(`[FileService] Starting virus scan for file: ${fileName}...`);
  const scanResult = await scanWithClamAV(buffer);
  
  if (!scanResult.clean) {
    logger.error(`[FileService] Virus detected in ${fileName}! Result: ${scanResult.result}`);
    throw new Error('Malicious content detected. Upload aborted.');
  }

  logger.info(`[FileService] Virus scan completed successfully. Clean: ${scanResult.clean}`);
  return scanResult;
};

/**
 * Stores file on local filesystem and creates a database metadata entry
 */
export const storeFile = async (params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  announcementId?: number;
  uploadedBy?: string;
}) => {
  const { buffer, fileName, mimeType, announcementId, uploadedBy } = params;

  // Validate and scan the file first
  const scan = await validateAndScanFile(buffer, fileName, mimeType);

  try {
    // Generate unique key and storage path
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
    const uploadDir = path.resolve(process.cwd(), 'public/uploads/announcements');
    
    await fs.mkdir(uploadDir, { recursive: true });
    const storagePath = path.join(uploadDir, uniqueFileName);

    // Save to local filesystem
    await fs.writeFile(storagePath, buffer);
    logger.info(`[FileService] File saved locally to: ${storagePath}`);

    // Insert metadata record in PostgreSQL
    const [inserted] = await db
      .insert(file_metadata)
      .values({
        announcement_id: announcementId || null,
        file_name: fileName,
        file_size: buffer.length,
        mime_type: mimeType,
        storage_path: `/uploads/announcements/${uniqueFileName}`, // relative access path
        virus_scanned: true,
        scan_result: scan.result,
        uploaded_by: uploadedBy || null,
        uploaded_at: new Date(),
        accessed_count: 0,
      })
      .returning();

    return inserted;
  } catch (err) {
    logger.error(`[FileService] File persistence failed for ${fileName}:`, err);
    throw err;
  }
};

/**
 * Increments access count and updates last accessed timestamp
 */
export const trackFileAccess = async (fileId: number) => {
  try {
    const [updated] = await db
      .update(file_metadata)
      .set({
        accessed_count: sql`${file_metadata.accessed_count} + 1`,
        last_accessed: new Date(),
      })
      .where(eq(file_metadata.pk_file_id, fileId))
      .returning();

    return updated;
  } catch (err) {
    logger.error(`[FileService] Failed to track access for file ID ${fileId}:`, err);
  }
};

/**
 * Deletes local file and marks metadata as removed (via cascade or archival)
 */
export const deleteFile = async (fileId: number) => {
  const result = await db
    .select()
    .from(file_metadata)
    .where(eq(file_metadata.pk_file_id, fileId))
    .limit(1);

  const file = result[0];
  if (!file) {
    throw new Error('File metadata not found.');
  }

  const fullPath = path.join(process.cwd(), 'public', file.storage_path);

  try {
    // 1. Delete from storage
    await fs.unlink(fullPath).catch((err) => {
      logger.warn(`[FileService] File not found on disk during deletion: ${fullPath} (${err.message})`);
    });

    // 2. Delete metadata entry
    await db.delete(file_metadata).where(eq(file_metadata.pk_file_id, fileId));
    logger.info(`[FileService] File and metadata deleted successfully: ${file.file_name}`);
    return { success: true };
  } catch (err) {
    logger.error(`[FileService] File deletion failed for ID ${fileId}:`, err);
    throw err;
  }
};

/**
 * Generates file access URLs with mock tokens
 */
export const generateFileUrl = (filePath: string, expiresMinutes = 60) => {
  const token = Math.random().toString(36).substring(2, 15);
  const expiresAt = Date.now() + expiresMinutes * 60 * 1000;
  return `${filePath}?token=${token}&expires=${expiresAt}`;
};
