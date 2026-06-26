import { and, eq, ilike, sql } from 'drizzle-orm';

import type { CreateStateDto, UpdateStateDto, ListStateDto } from './state.dto.js';
import type { State } from './state.types.js';

import { db } from '@/config/db.config.js';
import { cont_state, cont_country, cont_city, appUser } from '@/shared/database/schemas/index.js';

// ─── Dropdown ─────────────────────────────────────────────────────────────────

export async function getStateDropdown(countryId?: number): Promise<State[]> {
  const whereClause = countryId ? eq(cont_state.fk_ctry_id, countryId) : undefined;
  const rows = await db.select().from(cont_state).where(whereClause).orderBy(cont_state.state);
  return rows as State[];
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listStates(filters: ListStateDto) {
  const { state, country, state_code, last_status, username, page, page_size } = filters;
  const offset = (page - 1) * page_size;

  const conditions = [
    state ? ilike(cont_state.state, `${state}%`) : undefined,
    state_code ? ilike(cont_state.state_code, `${state_code}%`) : undefined,
    last_status ? ilike(cont_state.last_status, `${last_status}%`) : undefined,
    country ? ilike(cont_country.country, `${country}%`) : undefined,
    username ? ilike(appUser.username, `${username}%`) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      pk_state_id: cont_state.pk_state_id,
      state: cont_state.state,
      fk_ctry_id: cont_state.fk_ctry_id,
      state_code: cont_state.state_code,
      date_time_stamp: cont_state.date_time_stamp,
      fk_user_id: cont_state.fk_user_id,
      last_status: cont_state.last_status,
      country: cont_country.country,
      username: appUser.username,
    })
    .from(cont_state)
    .leftJoin(cont_country, eq(cont_state.fk_ctry_id, cont_country.pk_ctry_id))
    .leftJoin(appUser, eq(cont_state.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(cont_state.state)
    .limit(page_size)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cont_state)
    .leftJoin(cont_country, eq(cont_state.fk_ctry_id, cont_country.pk_ctry_id))
    .leftJoin(appUser, eq(cont_state.fk_user_id, appUser.pk_user_id))
    .where(conditions.length ? and(...conditions) : undefined);

  const count = countResult[0]?.count ?? 0;

  return { rows, total: count, page, page_size };
}

// ─── Find by ID ───────────────────────────────────────────────────────────────

export async function findStateById(id: number) {
  const [row] = await db
    .select({
      pk_state_id: cont_state.pk_state_id,
      state: cont_state.state,
      fk_ctry_id: cont_state.fk_ctry_id,
      state_code: cont_state.state_code,
      date_time_stamp: cont_state.date_time_stamp,
      fk_user_id: cont_state.fk_user_id,
      last_status: cont_state.last_status,
      country: cont_country.country,
      username: appUser.username,
    })
    .from(cont_state)
    .leftJoin(cont_country, eq(cont_state.fk_ctry_id, cont_country.pk_ctry_id))
    .leftJoin(appUser, eq(cont_state.fk_user_id, appUser.pk_user_id))
    .where(eq(cont_state.pk_state_id, id));

  return row ?? null;
}

// ─── Check Duplicate ─────────────────────────────────────────────────────────

export async function findStateByNameAndCountry(
  name: string,
  countryId: number,
  excludeId?: number,
) {
  const conditions = excludeId
    ? and(
        eq(cont_state.state, name),
        eq(cont_state.fk_ctry_id, countryId),
        sql`${cont_state.pk_state_id} <> ${excludeId}`,
      )
    : and(eq(cont_state.state, name), eq(cont_state.fk_ctry_id, countryId));

  const [row] = await db
    .select({ pk_state_id: cont_state.pk_state_id })
    .from(cont_state)
    .where(conditions);

  return row ?? null;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createState(dto: CreateStateDto) {
  const [inserted] = await db
    .insert(cont_state)
    .values({
      state: dto.state.trim(),
      fk_ctry_id: dto.fk_ctry_id,
      state_code: dto.state_code.trim(),
      date_time_stamp: new Date(),
      fk_user_id: dto.fk_user_id,
      last_status: 'Added',
    })
    .returning();

  return inserted;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateState(id: number, dto: UpdateStateDto) {
  const [updated] = await db
    .update(cont_state)
    .set({
      ...(dto.state !== undefined && { state: dto.state.trim() }),
      ...(dto.fk_ctry_id !== undefined && { fk_ctry_id: dto.fk_ctry_id }),
      ...(dto.state_code !== undefined && { state_code: dto.state_code.trim() }),
      ...(dto.fk_user_id !== undefined && { fk_user_id: dto.fk_user_id }),
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(cont_state.pk_state_id, id))
    .returning();

  return updated ?? null;
}

// ─── Delete Guard ─────────────────────────────────────────────────────────────

export async function isStateDeletable(id: number): Promise<boolean> {
  const [cities] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cont_city)
    .where(eq(cont_city.fk_state_id, id));

  return (cities?.count ?? 0) === 0;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteState(id: number) {
  const [deleted] = await db.delete(cont_state).where(eq(cont_state.pk_state_id, id)).returning();

  return deleted ?? null;
}
