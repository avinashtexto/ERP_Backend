import { eq, and, ilike, ne, sql, type SQL } from 'drizzle-orm';

import type {
  CreateSalSkintoneDto,
  UpdateSalSkintoneDto,
  SalSkintoneQuery,
  SalSkintoneResponse,
  CreateSalCastesDto,
  UpdateSalCastesDto,
  SalCastesQuery,
  SalCastesResponse,
  CreateSalReligionDto,
  UpdateSalReligionDto,
  SalReligionQuery,
  SalReligionResponse,
  CreateSalScheduleTypeDto,
  UpdateSalScheduleTypeDto,
  SalScheduleTypeQuery,
  SalScheduleTypeResponse,
} from './master-salary.types.js';

import { db } from '@/config/db.config.js';
import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { sal_castes } from '@/shared/database/schemas/sal-castes.schema.js';
import { sal_religion } from '@/shared/database/schemas/sal-religion.schema.js';
import { sal_schedule_type } from '@/shared/database/schemas/sal-schedule-type.schema.js';
import { sal_skintone } from '@/shared/database/schemas/sal-skintone.schema.js';
import { logger } from '@/shared/utils/devHelper.js';

// ============================================================================
// Skintone Service Functions
// ============================================================================

export async function findAllSkintones(
  filters: SalSkintoneQuery = {},
): Promise<SalSkintoneResponse[]> {
  const conditions: SQL[] = [];

  if (filters.colour) {
    conditions.push(ilike(sal_skintone.colour, `%${filters.colour}%`));
  }
  if (filters.last_status) {
    conditions.push(ilike(sal_skintone.last_status, `%${filters.last_status}%`));
  }

  const rows = await db
    .select({
      pk_st_id: sal_skintone.pk_st_id,
      colour: sal_skintone.colour,
      date_time_stamp: sal_skintone.date_time_stamp,
      fk_user_id: sal_skintone.fk_user_id,
      last_status: sal_skintone.last_status,
      username: appUser.username,
    })
    .from(sal_skintone)
    .leftJoin(appUser, eq(sal_skintone.fk_user_id, appUser.pk_user_id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sal_skintone.colour);

  return rows as SalSkintoneResponse[];
}

export async function findSkintoneById(id: number): Promise<SalSkintoneResponse | null> {
  const rows = await db
    .select({
      pk_st_id: sal_skintone.pk_st_id,
      colour: sal_skintone.colour,
      date_time_stamp: sal_skintone.date_time_stamp,
      fk_user_id: sal_skintone.fk_user_id,
      last_status: sal_skintone.last_status,
      username: appUser.username,
    })
    .from(sal_skintone)
    .leftJoin(appUser, eq(sal_skintone.fk_user_id, appUser.pk_user_id))
    .where(eq(sal_skintone.pk_st_id, id))
    .limit(1);

  if (!rows[0]) return null;
  return rows[0] as SalSkintoneResponse;
}

export async function createSkintone(dto: CreateSalSkintoneDto): Promise<SalSkintoneResponse> {
  await assertSkintoneColourUnique(dto.colour);

  const payload = {
    colour: dto.colour.trim(),
    date_time_stamp: new Date(),
    fk_user_id: dto.fk_user_id,
    last_status: 'Added',
  };

  logger.info(`Creating Skintone: "${payload.colour}"`);

  const [created] = await db.insert(sal_skintone).values(payload).returning();
  if (!created) {
    throw new Error('Failed to create skintone record');
  }

  const result = await findSkintoneById(created.pk_st_id);
  if (!result) {
    throw new Error('Failed to retrieve created skintone record');
  }
  return result;
}

export async function updateSkintone(
  id: number,
  dto: UpdateSalSkintoneDto,
): Promise<SalSkintoneResponse> {
  await requireSkintoneById(id);

  if (dto.colour) {
    await assertSkintoneColourUnique(dto.colour, id);
  }

  const patch = {
    ...(dto.colour && { colour: dto.colour.trim() }),
    ...(dto.fk_user_id && { fk_user_id: dto.fk_user_id }),
    date_time_stamp: new Date(),
    last_status: 'Edited',
  };

  logger.info(`Updating Skintone ID: ${id}`);

  await db.update(sal_skintone).set(patch).where(eq(sal_skintone.pk_st_id, id));

  const result = await findSkintoneById(id);
  if (!result) {
    throw new Error('Failed to retrieve updated skintone record');
  }
  return result;
}

export async function deleteSkintone(id: number): Promise<void> {
  await requireSkintoneById(id);

  try {
    logger.info(`Deleting Skintone ID: ${id}`);
    await db.delete(sal_skintone).where(eq(sal_skintone.pk_st_id, id));
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
      throw new Error('Selected record cannot be deleted because it is related to other data.');
    }
    throw err;
  }
}

async function requireSkintoneById(id: number): Promise<SalSkintoneResponse> {
  const row = await findSkintoneById(id);
  if (!row) throw new Error(`Skintone with id ${id} not found.`);
  return row;
}

async function assertSkintoneColourUnique(colour: string, excludeId?: number): Promise<void> {
  const conditions: SQL[] = [ilike(sal_skintone.colour, colour.trim())];
  if (excludeId !== undefined) {
    conditions.push(ne(sal_skintone.pk_st_id, excludeId));
  }
  const existing = await db
    .select({ pk_st_id: sal_skintone.pk_st_id })
    .from(sal_skintone)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Skintone colour "${colour}" already exists.`);
  }
}

// ============================================================================
// Castes Service Functions
// ============================================================================

export async function findAllCastes(filters: SalCastesQuery = {}): Promise<SalCastesResponse[]> {
  const conditions: SQL[] = [];

  if (filters.caste) {
    conditions.push(ilike(sal_castes.caste, `%${filters.caste}%`));
  }
  if (filters.last_status) {
    conditions.push(ilike(sal_castes.last_status, `%${filters.last_status}%`));
  }

  const rows = await db
    .select({
      pk_cs_id: sal_castes.pk_cs_id,
      caste: sal_castes.caste,
      date_time_stamp: sal_castes.date_time_stamp,
      fk_user_id: sal_castes.fk_user_id,
      last_status: sal_castes.last_status,
      username: appUser.username,
    })
    .from(sal_castes)
    .leftJoin(appUser, eq(sal_castes.fk_user_id, appUser.pk_user_id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sal_castes.caste);

  return rows as SalCastesResponse[];
}

export async function findCasteById(id: number): Promise<SalCastesResponse | null> {
  const rows = await db
    .select({
      pk_cs_id: sal_castes.pk_cs_id,
      caste: sal_castes.caste,
      date_time_stamp: sal_castes.date_time_stamp,
      fk_user_id: sal_castes.fk_user_id,
      last_status: sal_castes.last_status,
      username: appUser.username,
    })
    .from(sal_castes)
    .leftJoin(appUser, eq(sal_castes.fk_user_id, appUser.pk_user_id))
    .where(eq(sal_castes.pk_cs_id, id))
    .limit(1);

  if (!rows[0]) return null;
  return rows[0] as SalCastesResponse;
}

export async function createCaste(dto: CreateSalCastesDto): Promise<SalCastesResponse> {
  await assertCasteUnique(dto.caste);

  const payload = {
    caste: dto.caste.trim(),
    date_time_stamp: new Date(),
    fk_user_id: dto.fk_user_id,
    last_status: 'Added',
  };

  logger.info(`Creating Caste: "${payload.caste}"`);

  const [created] = await db.insert(sal_castes).values(payload).returning();
  if (!created) {
    throw new Error('Failed to create caste record');
  }

  const result = await findCasteById(created.pk_cs_id);
  if (!result) {
    throw new Error('Failed to retrieve created caste record');
  }
  return result;
}

export async function updateCaste(id: number, dto: UpdateSalCastesDto): Promise<SalCastesResponse> {
  await requireCasteById(id);

  if (dto.caste) {
    await assertCasteUnique(dto.caste, id);
  }

  const patch = {
    ...(dto.caste && { caste: dto.caste.trim() }),
    ...(dto.fk_user_id && { fk_user_id: dto.fk_user_id }),
    date_time_stamp: new Date(),
    last_status: 'Edited',
  };

  logger.info(`Updating Caste ID: ${id}`);

  await db.update(sal_castes).set(patch).where(eq(sal_castes.pk_cs_id, id));

  const result = await findCasteById(id);
  if (!result) {
    throw new Error('Failed to retrieve updated caste record');
  }
  return result;
}

export async function deleteCaste(id: number): Promise<void> {
  await requireCasteById(id);

  try {
    logger.info(`Deleting Caste ID: ${id}`);
    await db.delete(sal_castes).where(eq(sal_castes.pk_cs_id, id));
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
      throw new Error('Selected record cannot be deleted because it is related to other data.');
    }
    throw err;
  }
}

async function requireCasteById(id: number): Promise<SalCastesResponse> {
  const row = await findCasteById(id);
  if (!row) throw new Error(`Caste with id ${id} not found.`);
  return row;
}

async function assertCasteUnique(caste: string, excludeId?: number): Promise<void> {
  const conditions: SQL[] = [ilike(sal_castes.caste, caste.trim())];
  if (excludeId !== undefined) {
    conditions.push(ne(sal_castes.pk_cs_id, excludeId));
  }
  const existing = await db
    .select({ pk_cs_id: sal_castes.pk_cs_id })
    .from(sal_castes)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Caste name "${caste}" already exists.`);
  }
}

// ============================================================================
// Religion Service Functions
// ============================================================================

export async function findAllReligions(
  filters: SalReligionQuery = {},
): Promise<SalReligionResponse[]> {
  const conditions: SQL[] = [];

  if (filters.religion) {
    conditions.push(ilike(sal_religion.religion, `%${filters.religion}%`));
  }
  if (filters.last_status) {
    conditions.push(ilike(sal_religion.last_status, `%${filters.last_status}%`));
  }

  const rows = await db
    .select({
      pk_rg_id: sal_religion.pk_rg_id,
      religion: sal_religion.religion,
      date_time_stamp: sal_religion.date_time_stamp,
      fk_user_id: sal_religion.fk_user_id,
      last_status: sal_religion.last_status,
      username: appUser.username,
    })
    .from(sal_religion)
    .leftJoin(appUser, eq(sal_religion.fk_user_id, appUser.pk_user_id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sal_religion.religion);

  return rows as SalReligionResponse[];
}

export async function findReligionById(id: number): Promise<SalReligionResponse | null> {
  const rows = await db
    .select({
      pk_rg_id: sal_religion.pk_rg_id,
      religion: sal_religion.religion,
      date_time_stamp: sal_religion.date_time_stamp,
      fk_user_id: sal_religion.fk_user_id,
      last_status: sal_religion.last_status,
      username: appUser.username,
    })
    .from(sal_religion)
    .leftJoin(appUser, eq(sal_religion.fk_user_id, appUser.pk_user_id))
    .where(eq(sal_religion.pk_rg_id, id))
    .limit(1);

  if (!rows[0]) return null;
  return rows[0] as SalReligionResponse;
}

export async function createReligion(dto: CreateSalReligionDto): Promise<SalReligionResponse> {
  await assertReligionUnique(dto.religion);

  const payload = {
    religion: dto.religion.trim(),
    date_time_stamp: new Date(),
    fk_user_id: dto.fk_user_id,
    last_status: 'Added',
  };

  logger.info(`Creating Religion: "${payload.religion}"`);

  const [created] = await db.insert(sal_religion).values(payload).returning();
  if (!created) {
    throw new Error('Failed to create religion record');
  }

  const result = await findReligionById(created.pk_rg_id);
  if (!result) {
    throw new Error('Failed to retrieve created religion record');
  }
  return result;
}

export async function updateReligion(
  id: number,
  dto: UpdateSalReligionDto,
): Promise<SalReligionResponse> {
  await requireReligionById(id);

  if (dto.religion) {
    await assertReligionUnique(dto.religion, id);
  }

  const patch = {
    ...(dto.religion && { religion: dto.religion.trim() }),
    ...(dto.fk_user_id && { fk_user_id: dto.fk_user_id }),
    date_time_stamp: new Date(),
    last_status: 'Edited',
  };

  logger.info(`Updating Religion ID: ${id}`);

  await db.update(sal_religion).set(patch).where(eq(sal_religion.pk_rg_id, id));

  const result = await findReligionById(id);
  if (!result) {
    throw new Error('Failed to retrieve updated religion record');
  }
  return result;
}

export async function deleteReligion(id: number): Promise<void> {
  await requireReligionById(id);

  try {
    logger.info(`Deleting Religion ID: ${id}`);
    await db.delete(sal_religion).where(eq(sal_religion.pk_rg_id, id));
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
      throw new Error('Selected record cannot be deleted because it is related to other data.');
    }
    throw err;
  }
}

async function requireReligionById(id: number): Promise<SalReligionResponse> {
  const row = await findReligionById(id);
  if (!row) throw new Error(`Religion with id ${id} not found.`);
  return row;
}

async function assertReligionUnique(religion: string, excludeId?: number): Promise<void> {
  const conditions: SQL[] = [ilike(sal_religion.religion, religion.trim())];
  if (excludeId !== undefined) {
    conditions.push(ne(sal_religion.pk_rg_id, excludeId));
  }
  const existing = await db
    .select({ pk_rg_id: sal_religion.pk_rg_id })
    .from(sal_religion)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Religion name "${religion}" already exists.`);
  }
}

// ============================================================================
// ScheduleType Service Functions
// ============================================================================

export async function findAllScheduleTypes(
  filters: SalScheduleTypeQuery = {},
): Promise<SalScheduleTypeResponse[]> {
  const conditions: SQL[] = [];

  if (filters.type) {
    conditions.push(ilike(sal_schedule_type.type, `%${filters.type}%`));
  }
  if (filters.last_status) {
    conditions.push(ilike(sal_schedule_type.last_status, `%${filters.last_status}%`));
  }

  const rows = await db
    .select({
      pk_st_id: sal_schedule_type.pk_st_id,
      type: sal_schedule_type.type,
      date_time_stamp: sal_schedule_type.date_time_stamp,
      fk_user_id: sal_schedule_type.fk_user_id,
      last_status: sal_schedule_type.last_status,
      username: appUser.username,
    })
    .from(sal_schedule_type)
    .leftJoin(appUser, eq(sal_schedule_type.fk_user_id, appUser.pk_user_id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sal_schedule_type.type);

  return rows as SalScheduleTypeResponse[];
}

export async function findScheduleTypeById(id: number): Promise<SalScheduleTypeResponse | null> {
  const rows = await db
    .select({
      pk_st_id: sal_schedule_type.pk_st_id,
      type: sal_schedule_type.type,
      date_time_stamp: sal_schedule_type.date_time_stamp,
      fk_user_id: sal_schedule_type.fk_user_id,
      last_status: sal_schedule_type.last_status,
      username: appUser.username,
    })
    .from(sal_schedule_type)
    .leftJoin(appUser, eq(sal_schedule_type.fk_user_id, appUser.pk_user_id))
    .where(eq(sal_schedule_type.pk_st_id, id))
    .limit(1);

  if (!rows[0]) return null;
  return rows[0] as SalScheduleTypeResponse;
}

export async function createScheduleType(
  dto: CreateSalScheduleTypeDto,
): Promise<SalScheduleTypeResponse> {
  await assertScheduleTypeUnique(dto.type);

  const payload = {
    type: dto.type.trim(),
    date_time_stamp: new Date(),
    fk_user_id: dto.fk_user_id,
    last_status: 'Added',
  };

  logger.info(`Creating ScheduleType: "${payload.type}"`);

  const [created] = await db.insert(sal_schedule_type).values(payload).returning();
  if (!created) {
    throw new Error('Failed to create schedule type record');
  }

  const result = await findScheduleTypeById(created.pk_st_id);
  if (!result) {
    throw new Error('Failed to retrieve created schedule type record');
  }
  return result;
}

export async function updateScheduleType(
  id: number,
  dto: UpdateSalScheduleTypeDto,
): Promise<SalScheduleTypeResponse> {
  await requireScheduleTypeById(id);

  if (dto.type) {
    await assertScheduleTypeUnique(dto.type, id);
  }

  const patch = {
    ...(dto.type && { type: dto.type.trim() }),
    ...(dto.fk_user_id && { fk_user_id: dto.fk_user_id }),
    date_time_stamp: new Date(),
    last_status: 'Edited',
  };

  logger.info(`Updating ScheduleType ID: ${id}`);

  await db.update(sal_schedule_type).set(patch).where(eq(sal_schedule_type.pk_st_id, id));

  const result = await findScheduleTypeById(id);
  if (!result) {
    throw new Error('Failed to retrieve updated schedule type record');
  }
  return result;
}

export async function deleteScheduleType(id: number): Promise<void> {
  await requireScheduleTypeById(id);

  try {
    logger.info(`Deleting ScheduleType ID: ${id}`);
    await db.delete(sal_schedule_type).where(eq(sal_schedule_type.pk_st_id, id));
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
      throw new Error('Selected record cannot be deleted because it is related to other data.');
    }
    throw err;
  }
}

async function requireScheduleTypeById(id: number): Promise<SalScheduleTypeResponse> {
  const row = await findScheduleTypeById(id);
  if (!row) throw new Error(`ScheduleType with id ${id} not found.`);
  return row;
}

async function assertScheduleTypeUnique(type: string, excludeId?: number): Promise<void> {
  const conditions: SQL[] = [ilike(sal_schedule_type.type, type.trim())];
  if (excludeId !== undefined) {
    conditions.push(ne(sal_schedule_type.pk_st_id, excludeId));
  }
  const existing = await db
    .select({ pk_st_id: sal_schedule_type.pk_st_id })
    .from(sal_schedule_type)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Schedule type name "${type}" already exists.`);
  }
}
