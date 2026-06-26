import { db } from '../config/db.config.js';
import { audit_log } from '../shared/database/schemas/index.js';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { logger } from '../shared/utils/devHelper.js';
import { DEFAULT_RETENTION_DAYS } from './audit-log.config.js';

/**
 * Helper to compute field-level differences between two states
 */
export const diffStates = (oldValues: any, newValues: any): Record<string, { from: any; to: any }> | null => {
  if (!oldValues || !newValues) return null;
  
  const diffs: Record<string, { from: any; to: any }> = {};
  const unionKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
  
  for (const key of unionKeys) {
    const oldStr = JSON.stringify(oldValues[key]);
    const newStr = JSON.stringify(newValues[key]);
    
    if (oldStr !== newStr) {
      diffs[key] = {
        from: oldValues[key],
        to: newValues[key]
      };
    }
  }
  
  return Object.keys(diffs).length > 0 ? diffs : null;
};

/**
 * Creates a new audit log record
 */
export const logAction = async (params: {
  action: 'create' | 'update' | 'delete' | 'authorize' | 'view' | 'schedule' | 'cancel-schedule';
  resource: string;
  resourceId?: number | null;
  oldValues?: any;
  newValues?: any;
  userId?: string | null;
  userIp?: string | null;
  userAgent?: string | null;
}) => {
  try {
    const { action, resource, resourceId, oldValues, newValues, userId, userIp, userAgent } = params;

    // Track field-level differences for updates
    let finalOld = oldValues || null;
    let finalNew = newValues || null;
    if (action === 'update' && oldValues && newValues) {
      const fieldDiffs = diffStates(oldValues, newValues);
      if (fieldDiffs) {
        finalOld = { _metadata: 'Field-level diff (old values)', ...oldValues };
        finalNew = { _metadata: 'Field-level diff (new values)', ...newValues, _changes: fieldDiffs };
      }
    }

    const [inserted] = await db
      .insert(audit_log)
      .values({
        action,
        resource,
        resource_id: resourceId || null,
        old_values: finalOld,
        new_values: finalNew,
        user_id: userId || null,
        user_ip: userIp || null,
        user_agent: userAgent || null,
        timestamp: new Date(),
      })
      .returning();

    logger.info(`[AuditLog] Logged ${action} action on ${resource} (ID: ${resourceId}) by User: ${userId}`);
    return inserted;
  } catch (err) {
    logger.error('[AuditLog] Failed to persist audit log:', err);
    // Don't crash request if audit logging fails, just report it
  }
};

/**
 * Queries the audit log with filters and pagination
 */
export const getAuditTrail = async (filters: {
  resource?: string;
  resourceId?: number;
  userId?: string;
  action?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters.resource) conditions.push(eq(audit_log.resource, filters.resource));
  if (filters.resourceId) conditions.push(eq(audit_log.resource_id, filters.resourceId));
  if (filters.userId) conditions.push(eq(audit_log.user_id, filters.userId));
  if (filters.action) conditions.push(eq(audit_log.action, filters.action));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const logs = await db
    .select()
    .from(audit_log)
    .where(whereClause)
    .orderBy(desc(audit_log.timestamp))
    .limit(limit)
    .offset(offset);

  const [totalCountResult] = await db
    .select({ count: count() })
    .from(audit_log)
    .where(whereClause);

  const total = totalCountResult?.count || 0;

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }
  };
};

/**
 * Enforces a data retention policy (deletes logs older than N days)
 */
export const enforceRetentionPolicy = async (daysToKeep = DEFAULT_RETENTION_DAYS) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Using SQL template literal to delete records
    const result = await db.execute(
      sql`DELETE FROM "audit_log" WHERE "timestamp" < ${cutoffDate}`
    );

    logger.info(`[AuditLog] Retention cleanup ran. Removed audit logs older than ${daysToKeep} days.`);
    return result;
  } catch (err) {
    logger.error('[AuditLog] Retention policy cleanup failed:', err);
    throw err;
  }
};
