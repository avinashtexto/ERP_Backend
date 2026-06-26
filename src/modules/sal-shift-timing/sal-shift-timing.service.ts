import { db } from '@/config/db.config.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { sal_shift_timing } from '@/shared/database/schemas/index.js';
import type { ShiftTimingInput, ShiftTimingUpdate } from './sal-shift-timing.types.js';

export async function createShiftTiming(data: ShiftTimingInput) {
  const result = await db.insert(sal_shift_timing).values(data).returning();
  return result[0];
}

export async function getShiftTimingById(id: number) {
  const result = await db.select().from(sal_shift_timing).where(eq(sal_shift_timing.pk_st_id, id)).limit(1);
  return result[0] || null;
}

export async function getAllShiftTimings(filters?: { shift?: string; last_status?: string }) {
  const conditions = [];
  if (filters?.shift) {
    conditions.push(eq(sal_shift_timing.shift, filters.shift));
  }
  if (filters?.last_status) {
    conditions.push(eq(sal_shift_timing.last_status, filters.last_status));
  }

  const query = db.select().from(sal_shift_timing).orderBy(desc(sal_shift_timing.pk_st_id));
  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }
  return await query;
}

export async function updateShiftTiming(id: number, data: ShiftTimingUpdate) {
  const result = await db
    .update(sal_shift_timing)
    .set({ ...data, date_time_stamp: new Date() })
    .where(eq(sal_shift_timing.pk_st_id, id))
    .returning();
  return result[0] || null;
}

export async function deleteShiftTiming(id: number) {
  const result = await db.delete(sal_shift_timing).where(eq(sal_shift_timing.pk_st_id, id)).returning();
  return result[0] || null;
}
