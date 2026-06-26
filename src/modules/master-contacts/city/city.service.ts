import { eq, ilike, and, sql } from 'drizzle-orm';

import type {
  CreateCityDto,
  UpdateCityDto,
  CityFilterParams,
  CityDropdownItem,
  PaginatedResponse,
  City,
} from './city.types.js';

import { db } from '@/config/db.config.js';
import { cont_city } from '@/shared/database/schemas/cont-city.schema.js';
import { cont_country } from '@/shared/database/schemas/cont-country.schema.js';
import { cont_state } from '@/shared/database/schemas/cont-state.schema.js';

// ─────────────────────────────────────────────
// city.service.ts
// ─────────────────────────────────────────────

// ── FillCity dropdown (mirrors VB FillCity) ──────────────────────────
export async function getDropdownList(): Promise<CityDropdownItem[]> {
  const rows = await db
    .select({
      pk_city_id: cont_city.pk_city_id,
      city: cont_city.city,
      fk_state_id: cont_city.fk_state_id,
      fk_ctry_id: cont_city.fk_ctry_id,
      std_code: cont_city.std_code,
      state: cont_state.state,
      country: cont_country.country,
      isd_code: cont_country.isd_code,
    })
    .from(cont_city)
    .leftJoin(cont_state, eq(cont_city.fk_state_id, cont_state.pk_state_id))
    .leftJoin(cont_country, eq(cont_city.fk_ctry_id, cont_country.pk_ctry_id))
    .orderBy(cont_city.city);

  return rows as CityDropdownItem[];
}

// ── List with optional filter (mirrors grList filter logic) ──────────
export async function getList(
  params: CityFilterParams,
): Promise<PaginatedResponse<CityDropdownItem>> {
  const { city, state, country, page = 1, limit = 100 } = params;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (city) conditions.push(ilike(cont_city.city, `${city}%`));
  if (state) conditions.push(ilike(cont_state.state, `${state}%`));
  if (country) conditions.push(ilike(cont_country.country, `${country}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        pk_city_id: cont_city.pk_city_id,
        city: cont_city.city,
        fk_state_id: cont_city.fk_state_id,
        fk_ctry_id: cont_city.fk_ctry_id,
        std_code: cont_city.std_code,
        state: cont_state.state,
        country: cont_country.country,
        isd_code: cont_country.isd_code,
      })
      .from(cont_city)
      .leftJoin(cont_state, eq(cont_city.fk_state_id, cont_state.pk_state_id))
      .leftJoin(cont_country, eq(cont_city.fk_ctry_id, cont_country.pk_ctry_id))
      .where(whereClause)
      .orderBy(cont_city.city)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(cont_city)
      .leftJoin(cont_state, eq(cont_city.fk_state_id, cont_state.pk_state_id))
      .leftJoin(cont_country, eq(cont_city.fk_ctry_id, cont_country.pk_ctry_id))
      .where(whereClause),
  ]);

  return {
    data: rows as CityDropdownItem[],
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  };
}

// ── Get single city ───────────────────────────────────────────────────
export async function getById(pk_city_id: number): Promise<City | null> {
  const result = await db
    .select()
    .from(cont_city)
    .where(eq(cont_city.pk_city_id, pk_city_id))
    .limit(1);

  return (result[0] as City) ?? null;
}

// ── Check duplicate city name (mirrors ValidateFields) ───────────────
export async function isDuplicate(city: string, excludeId?: number): Promise<boolean> {
  const rows = await db
    .select({ pk_city_id: cont_city.pk_city_id, city: cont_city.city })
    .from(cont_city)
    .where(ilike(cont_city.city, city.trim()));

  return rows.some((c) => {
    if (excludeId !== undefined && c.pk_city_id === excludeId) return false;
    return c.city.trim().toLowerCase() === city.trim().toLowerCase();
  });
}

// ── Create (mirrors AddNew + Update) ─────────────────────────────────
export async function create(dto: CreateCityDto): Promise<City> {
  const [row] = await db
    .insert(cont_city)
    .values({
      city: dto.city,
      fk_state_id: dto.fk_state_id ?? null,
      fk_ctry_id: dto.fk_ctry_id,
      std_code: dto.std_code ?? '',
      fk_user_id: dto.fk_user_id,
      date_time_stamp: new Date(),
      last_status: 'Added',
    })
    .returning();

  return row as City;
}

// ── Update ────────────────────────────────────────────────────────────
export async function update(pk_city_id: number, dto: UpdateCityDto): Promise<City | null> {
  const existing = await getById(pk_city_id);
  if (!existing) return null;

  const [row] = await db
    .update(cont_city)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(cont_city.pk_city_id, pk_city_id))
    .returning();

  return (row as City) ?? null;
}

// ── Delete (mirrors DeletePossible check + actual delete) ─────────────
export async function canDelete(pk_city_id: number): Promise<boolean> {
  // Check FK references in cont_address
  const ref = await db.execute(
    sql`SELECT 1 FROM cont_address WHERE fk_city_id = ${pk_city_id} LIMIT 1`,
  );
  return (ref.rows ?? ref).length === 0;
}

export async function deleteCity(pk_city_id: number): Promise<boolean> {
  const deletable = await canDelete(pk_city_id);
  if (!deletable) return false;

  await db.delete(cont_city).where(eq(cont_city.pk_city_id, pk_city_id));

  return true;
}
