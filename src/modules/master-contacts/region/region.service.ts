import { and, eq, ilike, sql } from 'drizzle-orm';

import type { CreateRegionDto, UpdateRegionDto, ListRegionDto } from './region.dto.js';

import { db } from '@/config/db.config.js';
import { appUser, contRegion } from '@/shared/database/schemas/index.js';

// ─── Dropdown ─────────────────────────────────────────────────────────────────

export async function getRegionDropdown() {
  return db.select().from(contRegion).orderBy(contRegion.region);
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listRegions(filters: ListRegionDto) {
  const { region, last_status, username, page, page_size } = filters;
  const offset = (page - 1) * page_size;

  const conditions = [
    region ? ilike(contRegion.region, `${region}%`) : undefined,
    last_status ? ilike(contRegion.last_status, `${last_status}%`) : undefined,
    username ? ilike(appUser.username, `${username}%`) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      pk_reg_id: contRegion.pk_reg_id,
      region: contRegion.region,
      rate1: contRegion.rate1,
      rate2: contRegion.rate2,
      date_timestamp: contRegion.date_timestamp,
      fk_user_id: contRegion.fk_user_id,
      last_status: contRegion.last_status,
      username: appUser.username,
    })
    .from(contRegion)
    .leftJoin(appUser, eq(contRegion.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contRegion.region)
    .limit(page_size)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contRegion)
    .leftJoin(appUser, eq(contRegion.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined);

  const count = countResult[0]?.count ?? 0;

  return { rows, total: count, page, page_size };
}

// ─── Find by ID ───────────────────────────────────────────────────────────────

export async function findRegionById(id: number) {
  const [row] = await db
    .select({
      pk_reg_id: contRegion.pk_reg_id,
      region: contRegion.region,
      rate1: contRegion.rate1,
      rate2: contRegion.rate2,
      date_timestamp: contRegion.date_timestamp,
      fk_user_id: contRegion.fk_user_id,
      last_status: contRegion.last_status,
      username: appUser.username,
    })
    .from(contRegion)
    .leftJoin(appUser, eq(contRegion.fk_user_id, appUser.pk_user_id))
    .where(eq(contRegion.pk_reg_id, id));

  return row ?? null;
}

// ─── Check Duplicate ─────────────────────────────────────────────────────────

export async function findRegionByName(region: string, excludeId?: number) {
  const conditions = excludeId
    ? and(eq(contRegion.region, region), sql`${contRegion.pk_reg_id} <> ${excludeId}`)
    : eq(contRegion.region, region);

  const [row] = await db
    .select({ pk_reg_id: contRegion.pk_reg_id })
    .from(contRegion)
    .where(conditions);

  return row ?? null;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createRegion(dto: CreateRegionDto) {
  const [inserted] = await db
    .insert(contRegion)
    .values({
      region: dto.region.trim(),
      rate1: String(dto.rate1),
      rate2: String(dto.rate2),
      date_timestamp: new Date(),
      fk_user_id: dto.fk_user_id,
      last_status: 'Added',
    })
    .returning();

  return inserted;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateRegion(id: number, dto: UpdateRegionDto) {
  const [updated] = await db
    .update(contRegion)
    .set({
      ...(dto.region !== undefined && { region: dto.region.trim() }),
      ...(dto.rate1 !== undefined && { rate1: String(dto.rate1) }),
      ...(dto.rate2 !== undefined && { rate2: String(dto.rate2) }),
      ...(dto.fk_user_id !== undefined && { fk_user_id: dto.fk_user_id }),
      date_timestamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contRegion.pk_reg_id, id))
    .returning();

  return updated ?? null;
}

// ─── Delete Guard ─────────────────────────────────────────────────────────────

export async function isRegionDeletable(id: number): Promise<boolean> {
  return true;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteRegion(id: number) {
  const [deleted] = await db.delete(contRegion).where(eq(contRegion.pk_reg_id, id)).returning();

  return deleted ?? null;
}
