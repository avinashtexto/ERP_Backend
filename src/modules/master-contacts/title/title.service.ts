import { eq, ilike, and, ne, getTableColumns, sql } from 'drizzle-orm';

import type { CreateTitleInput, UpdateTitleInput, TitleQueryInput } from './title.dto.js';

import { db } from '@/config/db.config.js';
import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { contTitle } from '@/shared/database/schemas/cont-title.schema.js';
import type { ContTitle, NewContTitle } from '@/shared/database/schemas/cont-title.schema.js';

// ─────────────────────────────────────────────
// title.service.ts
// ─────────────────────────────────────────────

// ── List all titles with optional search filter ────────────────────────
export async function findAll(
  filters: TitleQueryInput = {},
): Promise<(ContTitle & { username: string | null })[]> {
  const conditions: any[] = [];
  if (filters.search) conditions.push(ilike(contTitle.title, `%${filters.search}%`));
  if (filters.last_status) conditions.push(ilike(contTitle.last_status, `${filters.last_status}%`));

  const rows = await db
    .select({ ...getTableColumns(contTitle), username: appUser.username })
    .from(contTitle)
    .leftJoin(appUser, eq(contTitle.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contTitle.title);

  return rows as any;
}

// ── Get single title by PK ─────────────────────────────────────────────
export async function findById(
  id: number,
): Promise<(ContTitle & { username: string | null }) | null> {
  const rows = await db
    .select({ ...getTableColumns(contTitle), username: appUser.username })
    .from(contTitle)
    .leftJoin(appUser, eq(contTitle.fk_user_id, appUser.pk_user_id))
    .where(eq(contTitle.pk_tit_id, id))
    .limit(1);

  return (rows[0] as any) ?? null;
}

// ── Check for duplicate title name ────────────────────────────────────
export async function isDuplicate(title: string, excludeId?: number): Promise<boolean> {
  const rows = await db
    .select({ pk_tit_id: contTitle.pk_tit_id, title: contTitle.title })
    .from(contTitle)
    .where(ilike(contTitle.title, title.trim()));

  return rows.some((t) => {
    if (excludeId !== undefined && t.pk_tit_id === excludeId) return false;
    return t.title.trim().toLowerCase() === title.trim().toLowerCase();
  });
}

// ── Create ─────────────────────────────────────────────────────────────
export async function create(dto: CreateTitleInput): Promise<ContTitle> {
  const payload: NewContTitle = {
    title: dto.title,
    fk_user_id: dto.fk_user_id,
    date_time_stamp: new Date(),
    last_status: 'Added',
  };

  const [created] = await db.insert(contTitle).values(payload).returning();
  if (!created) throw new Error('Title creation failed to return record.');
  return created;
}

// ── Update ─────────────────────────────────────────────────────────────
export async function update(id: number, dto: UpdateTitleInput): Promise<ContTitle | null> {
  const existing = await db
    .select({ pk_tit_id: contTitle.pk_tit_id })
    .from(contTitle)
    .where(eq(contTitle.pk_tit_id, id))
    .limit(1);

  if (!existing.length) return null;

  const [updated] = await db
    .update(contTitle)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(contTitle.pk_tit_id, id))
    .returning();

  return updated ?? null;
}

// ── Delete ─────────────────────────────────────────────────────────────
export async function deleteTitle(id: number): Promise<{ deleted: boolean; reason?: string }> {
  const rows = await db
    .select({ pk_tit_id: contTitle.pk_tit_id })
    .from(contTitle)
    .where(eq(contTitle.pk_tit_id, id))
    .limit(1);

  if (!rows.length) return { deleted: false, reason: 'NOT_FOUND' };

  try {
    await db.delete(contTitle).where(eq(contTitle.pk_tit_id, id));
    return { deleted: true };
  } catch (err: any) {
    if (err.code === '23503') return { deleted: false, reason: 'FK_CONSTRAINT' };
    throw err;
  }
}
