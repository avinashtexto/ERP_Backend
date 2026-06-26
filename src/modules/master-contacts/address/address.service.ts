import { eq, ilike, and, sql } from 'drizzle-orm';

import type {
  Address,
  AddressListRow,
  CreateAddressDto,
  UpdateAddressDto,
  AddressFilterParams,
  PaginatedResponse,
} from './address.types.js';
import { buildReturnAddress } from './address.types.js';

import { db } from '@/config/db.config.js';
import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { cont_address } from '@/shared/database/schemas/cont-address.schema.js';
import { cont_city } from '@/shared/database/schemas/cont-city.schema.js';
import { cont_common } from '@/shared/database/schemas/cont-common.schema.js';
import { cont_country } from '@/shared/database/schemas/cont-country.schema.js';
import { cont_state } from '@/shared/database/schemas/cont-state.schema.js';
import { logger } from '@/shared/utils/devHelper.js';

// ─────────────────────────────────────────────
// address.service.ts
// ─────────────────────────────────────────────

// ── FillList  (mirrors the big SELECT in VB FillList) ─────────────────
export async function getList(
  params: AddressFilterParams,
): Promise<PaginatedResponse<AddressListRow>> {
  const {
    contact_name,
    address,
    region,
    pincode,
    city,
    state,
    country,
    last_status,
    date_time_stamp,
    page = 1,
    limit = 100,
  } = params;

  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (contact_name) conditions.push(ilike(cont_common.contact_name, `${contact_name}%`));
  if (address) conditions.push(ilike(cont_address.address, `${address}%`));
  if (region) conditions.push(ilike(cont_address.region, `${region}%`));
  if (pincode) conditions.push(sql`CAST(${cont_address.pincode} AS TEXT) ILIKE ${pincode + '%'}`);
  if (city) conditions.push(ilike(cont_city.city, `${city}%`));
  if (state) conditions.push(ilike(cont_state.state, `${state}%`));
  if (country) conditions.push(ilike(cont_country.country, `${country}%`));
  if (last_status) conditions.push(ilike(cont_address.last_status, `${last_status}%`));
  if (date_time_stamp)
    conditions.push(sql`DATE(${cont_address.date_time_stamp}) = ${date_time_stamp}`);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db
    .select({
      pk_ca_id: cont_address.pk_ca_id,
      address: cont_address.address,
      date_time_stamp: cont_address.date_time_stamp,
      fk_user_id: cont_address.fk_user_id,
      last_status: cont_address.last_status,
      username: appUser.username,
      pk_city_id: cont_city.pk_city_id,
      city: cont_city.city,
      pk_ctry_id: cont_country.pk_ctry_id,
      country: cont_country.country,
      pk_state_id: cont_state.pk_state_id,
      state: cont_state.state,
      region: cont_address.region,
      pincode: cont_address.pincode,
      fk_cont_id: cont_address.fk_cont_id,
      contact_name: cont_common.contact_name,
    })
    .from(cont_address)
    .leftJoin(cont_common, eq(cont_address.fk_cont_id, cont_common.pk_cont_id))
    .leftJoin(cont_city, eq(cont_address.fk_city_id, cont_city.pk_city_id))
    .leftJoin(cont_state, eq(cont_city.fk_state_id, cont_state.pk_state_id))
    .leftJoin(cont_country, eq(cont_city.fk_ctry_id, cont_country.pk_ctry_id))
    .leftJoin(appUser, eq(cont_address.fk_user_id, appUser.pk_user_id))
    .where(whereClause);

  const [rows, countResult] = await Promise.all([
    baseQuery.orderBy(cont_common.contact_name).limit(limit).offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(cont_address)
      .leftJoin(cont_common, eq(cont_address.fk_cont_id, cont_common.pk_cont_id))
      .leftJoin(cont_city, eq(cont_address.fk_city_id, cont_city.pk_city_id))
      .leftJoin(cont_state, eq(cont_city.fk_state_id, cont_state.pk_state_id))
      .leftJoin(cont_country, eq(cont_city.fk_ctry_id, cont_country.pk_ctry_id))
      .leftJoin(appUser, eq(cont_address.fk_user_id, appUser.pk_user_id))
      .where(whereClause),
  ]);

  return {
    data: rows as AddressListRow[],
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  };
}

// ── Get single address with joins ─────────────────────────────────────
export async function getById(pk_ca_id: number): Promise<AddressListRow | null> {
  const result = await db
    .select({
      pk_ca_id: cont_address.pk_ca_id,
      address: cont_address.address,
      date_time_stamp: cont_address.date_time_stamp,
      fk_user_id: cont_address.fk_user_id,
      last_status: cont_address.last_status,
      username: appUser.username,
      pk_city_id: cont_city.pk_city_id,
      city: cont_city.city,
      pk_ctry_id: cont_country.pk_ctry_id,
      country: cont_country.country,
      pk_state_id: cont_state.pk_state_id,
      state: cont_state.state,
      region: cont_address.region,
      pincode: cont_address.pincode,
      fk_cont_id: cont_address.fk_cont_id,
      contact_name: cont_common.contact_name,
    })
    .from(cont_address)
    .leftJoin(cont_common, eq(cont_address.fk_cont_id, cont_common.pk_cont_id))
    .leftJoin(cont_city, eq(cont_address.fk_city_id, cont_city.pk_city_id))
    .leftJoin(cont_state, eq(cont_city.fk_state_id, cont_state.pk_state_id))
    .leftJoin(cont_country, eq(cont_city.fk_ctry_id, cont_country.pk_ctry_id))
    .leftJoin(appUser, eq(cont_address.fk_user_id, appUser.pk_user_id))
    .where(eq(cont_address.pk_ca_id, pk_ca_id))
    .limit(1);

  return (result[0] as AddressListRow) ?? null;
}

// ── Duplicate check (mirrors ValidateFields) ──────────────────────────
export async function isDuplicate(
  fk_cont_id: number,
  address: string,
  excludeId?: number,
): Promise<boolean> {
  const rows = await db
    .select({ pk_ca_id: cont_address.pk_ca_id, address: cont_address.address })
    .from(cont_address)
    .where(
      and(eq(cont_address.fk_cont_id, fk_cont_id), ilike(cont_address.address, address.trim())),
    );

  return rows.some((r) => {
    if (excludeId !== undefined && r.pk_ca_id === excludeId) return false;
    return r.address.trim().toLowerCase() === address.trim().toLowerCase();
  });
}

// ── Create (mirrors Rs.Save.AddNew + Rs.Save.Update) ─────────────────
export async function create(dto: CreateAddressDto): Promise<Address> {
  const [row] = await db
    .insert(cont_address)
    .values({
      fk_cont_id: dto.fk_cont_id,
      address: dto.address,
      fk_city_id: dto.fk_city_id ?? null,
      region: dto.region ?? '',
      pincode: dto.pincode ?? null,
      date_time_stamp: new Date(),
      fk_user_id: dto.fk_user_id,
      last_status: 'Added',
    })
    .returning();

  // Update denormalized address on related transaction tables
  try {
    await _syncTransactionAddress((row as any).pk_ca_id as number, dto);
  } catch (error: any) {
    logger.warn(
      `Failed to sync transaction addresses for address ID ${(row as any).pk_ca_id}: ${error?.message || error}`,
    );
  }

  return row as Address;
}

// ── Update ────────────────────────────────────────────────────────────
export async function update(pk_ca_id: number, dto: UpdateAddressDto): Promise<Address | null> {
  const existing = await db
    .select({ pk_ca_id: cont_address.pk_ca_id })
    .from(cont_address)
    .where(eq(cont_address.pk_ca_id, pk_ca_id))
    .limit(1);

  if (!existing.length) return null;

  const [row] = await db
    .update(cont_address)
    .set({
      ...dto,
      date_time_stamp: new Date(),
      last_status: 'Edited',
    })
    .where(eq(cont_address.pk_ca_id, pk_ca_id))
    .returning();

  try {
    await _syncTransactionAddress(pk_ca_id, dto as CreateAddressDto);
  } catch (error: any) {
    logger.warn(
      `Failed to sync transaction addresses for address ID ${pk_ca_id}: ${error?.message || error}`,
    );
  }

  return (row as Address) ?? null;
}

// ── DeletePossible check (mirrors VB DeletePosible) ───────────────────
export async function canDelete(pk_ca_id: number): Promise<boolean> {
  const checks = await Promise.all([
    db.execute(sql`SELECT 1 FROM tran_sal_main WHERE fk_ca_id = ${pk_ca_id} LIMIT 1`),
    db.execute(sql`SELECT 1 FROM tran_si_main WHERE fk_ca_id = ${pk_ca_id} LIMIT 1`),
    db.execute(sql`SELECT 1 FROM tran_oa_main WHERE fk_ca_id = ${pk_ca_id} LIMIT 1`),
  ]);
  return checks.every((c) => c.rows.length === 0);
}

export async function deleteAddress(pk_ca_id: number): Promise<boolean> {
  const ok = await canDelete(pk_ca_id);
  if (!ok) return false;
  await db.delete(cont_address).where(eq(cont_address.pk_ca_id, pk_ca_id));
  return true;
}

export async function getOrganizationsDropdown() {
  return db
    .select({
      pk_cont_id: cont_common.pk_cont_id,
      contact_name: cont_common.contact_name,
      address: cont_common.address,
      fk_city_id: cont_common.fk_city_id,
      region: cont_common.region,
      pincode: cont_common.pincode,
      fk_state_id: cont_city.fk_state_id,
      fk_ctry_id: cont_city.fk_ctry_id,
    })
    .from(cont_common)
    .leftJoin(cont_city, eq(cont_common.fk_city_id, cont_city.pk_city_id))
    .orderBy(cont_common.contact_name);
}

// ── Sync denormalized address text (mirrors Cn.Execute Update Tran*) ──
async function _syncTransactionAddress(
  pk_ca_id: number,
  dto: Partial<CreateAddressDto>,
): Promise<void> {
  let cityName = '';
  let stateName = '';
  let countryName = '';

  if (dto.fk_city_id) {
    const cityRow = await db
      .select({
        city: cont_city.city,
        state: cont_state.state,
        country: cont_country.country,
      })
      .from(cont_city)
      .leftJoin(cont_state, eq(cont_city.fk_state_id, cont_state.pk_state_id))
      .leftJoin(cont_country, eq(cont_city.fk_ctry_id, cont_country.pk_ctry_id))
      .where(eq(cont_city.pk_city_id, dto.fk_city_id))
      .limit(1);

    cityName = cityRow[0]?.city ?? '';
    stateName = cityRow[0]?.state ?? '';
    countryName = cityRow[0]?.country ?? '';
  }

  const formatted = buildReturnAddress({
    address: dto.address ?? '',
    region: dto.region ?? '',
    city: cityName,
    pincode: dto.pincode ?? null,
    state: stateName,
    country: countryName,
  });

  const syncQueries = [
    sql`UPDATE tran_sal_main SET c_address = ${formatted} WHERE fk_ca_id = ${pk_ca_id}`,
    sql`UPDATE tran_si_main  SET c_address = ${formatted} WHERE fk_ca_id = ${pk_ca_id}`,
    sql`UPDATE tran_oa_main  SET c_address = ${formatted} WHERE fk_ca_id = ${pk_ca_id}`,
    sql`UPDATE tran_sal_trip SET address   = ${formatted} WHERE fk_ca_id = ${pk_ca_id}`,
  ];

  const results = await Promise.allSettled(syncQueries.map((query) => db.execute(query)));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const queryNames = ['tran_sal_main', 'tran_si_main', 'tran_oa_main', 'tran_sal_trip'];
      const error = result.reason as any;
      const message = String(error?.message || error);
      const tableName = queryNames[index];
      if (
        message.includes('does not exist') ||
        message.includes('undefined_table') ||
        message.includes('undefined_column')
      ) {
        logger.warn(`Skipping transaction sync for ${tableName}: ${message}`);
        return;
      }

      logger.error(`Transaction sync failed for ${tableName}: ${message}`);
    }
  });
}
