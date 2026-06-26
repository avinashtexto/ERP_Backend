import { and, eq, ilike, sql } from 'drizzle-orm';

import type {
  CreateModeOfContactDto,
  UpdateModeOfContactDto,
  ListModeOfContactDto,
} from './mode-of-contact.dto.js';

import { db } from '@/config/db.config.js';
import { appUser, contMocType, contMoc } from '@/shared/database/schemas/index.js';

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listModesOfContact(filters: ListModeOfContactDto) {
  const { moc, mode, last_status, username, page, page_size } = filters;
  const offset = (page - 1) * page_size;

  const conditions = [
    moc ? ilike(contMoc.moc, `${moc}%`) : undefined,
    last_status ? ilike(contMoc.last_status, `${last_status}%`) : undefined,
    mode ? ilike(contMocType.mode, `${mode}%`) : undefined,
    username ? ilike(appUser.username, `${username}%`) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      pk_moc_id: contMoc.pk_moc_id,
      moc: contMoc.moc,
      fk_mt_id: contMoc.fk_mt_id,
      date_timestamp: contMoc.date_timestamp,
      fk_user_id: contMoc.fk_user_id,
      last_status: contMoc.last_status,
      mode: contMocType.mode,
      username: appUser.username,
    })
    .from(contMoc)
    .leftJoin(contMocType, eq(contMoc.fk_mt_id, contMocType.pk_mt_id))
    .leftJoin(appUser, eq(contMoc.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contMoc.moc)
    .limit(page_size)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contMoc)
    .leftJoin(contMocType, eq(contMoc.fk_mt_id, contMocType.pk_mt_id))
    .leftJoin(appUser, eq(contMoc.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined);

  const count = countResult[0]?.count ?? 0;

  return { rows, total: count, page, page_size };
}

// ─── Find by ID ───────────────────────────────────────────────────────────────

export async function findModeOfContactById(id: number) {
  const [row] = await db
    .select({
      pk_moc_id: contMoc.pk_moc_id,
      moc: contMoc.moc,
      fk_mt_id: contMoc.fk_mt_id,
      date_timestamp: contMoc.date_timestamp,
      fk_user_id: contMoc.fk_user_id,
      last_status: contMoc.last_status,
      mode: contMocType.mode,
      username: appUser.username,
    })
    .from(contMoc)
    .leftJoin(contMocType, eq(contMoc.fk_mt_id, contMocType.pk_mt_id))
    .leftJoin(appUser, eq(contMoc.fk_user_id, appUser.pk_user_id))
    .where(eq(contMoc.pk_moc_id, id));

  return row ?? null;
}

// ─── Check Duplicate ─────────────────────────────────────────────────────────

export async function findModeOfContactByName(moc: string, excludeId?: number) {
  const conditions = excludeId
    ? and(eq(contMoc.moc, moc), sql`${contMoc.pk_moc_id} <> ${excludeId}`)
    : eq(contMoc.moc, moc);

  const [row] = await db.select({ pk_moc_id: contMoc.pk_moc_id }).from(contMoc).where(conditions);

  return row ?? null;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createModeOfContact(dto: CreateModeOfContactDto) {
  const [inserted] = await db
    .insert(contMoc)
    .values({
      moc: dto.moc.trim(),
      fk_mt_id: dto.fk_mt_id,
      date_timestamp: new Date(),
      fk_user_id: dto.fk_user_id,
      last_status: 'Added',
    })
    .returning();

  return inserted;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateModeOfContact(id: number, dto: UpdateModeOfContactDto) {
  const [updated] = await db
    .update(contMoc)
    .set({
      ...(dto.moc && { moc: dto.moc.trim() }),
      ...(dto.fk_mt_id && { fk_mt_id: dto.fk_mt_id }),
      ...(dto.fk_user_id && { fk_user_id: dto.fk_user_id }),
      date_timestamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contMoc.pk_moc_id, id))
    .returning();

  return updated ?? null;
}

// ─── Delete Guard ─────────────────────────────────────────────────────────────

export async function isModeOfContactDeletable(id: number): Promise<boolean> {
  return true;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteModeOfContact(id: number) {
  const [deleted] = await db.delete(contMoc).where(eq(contMoc.pk_moc_id, id)).returning();

  return deleted ?? null;
}

// ─── MOC Types Dropdown ────────────────────────────────────────────────────────

export async function getModeOfContactTypes() {
  return db.select().from(contMocType).orderBy(contMocType.mode);
}
