// ─── sal-nature-of-work.service.ts ──────────────────────────────────────────
import { eq, ilike, sql, and, ne, type SQL } from 'drizzle-orm';

import type {
  CreateNatureOfWorkInput,
  UpdateNatureOfWorkInput,
  DeleteNatureOfWorkInput,
} from './sal-nature-of-work.dto.js';
import type {
  NatureOfWorkRow,
  NatureOfWorkListFilter,
  ApiResponse,
} from './sal-nature-of-work.types.js';

import { db } from '@/config/db.config.js';
import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { sal_nature_of_work } from '@/shared/database/schemas/sal-nature-of-work.schema.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

const buildListConditions = (filter: NatureOfWorkListFilter): SQL[] => {
  const conditions: SQL[] = [];

  if (filter.nature_of_work) {
    conditions.push(ilike(sal_nature_of_work.nature_of_work, `${filter.nature_of_work}%`));
  }
  if (filter.last_status) {
    conditions.push(ilike(sal_nature_of_work.last_status, `${filter.last_status}%`));
  }
  if (filter.date_timestamp) {
    conditions.push(
      sql`${sal_nature_of_work.date_timestamp}::date = ${filter.date_timestamp}::date`,
    );
  }
  return conditions;
};

// ─── list ─────────────────────────────────────────────────────────────────────

export const listNatureOfWork = async (
  filter: NatureOfWorkListFilter,
): Promise<ApiResponse<NatureOfWorkRow[]>> => {
  try {
    const conditions = buildListConditions(filter);

    if (filter.username) {
      conditions.push(ilike(appUser.username, `${filter.username}%`));
    }

    const rows = await db
      .select({
        pk_nw_id: sal_nature_of_work.pk_nw_id,
        nature_of_work: sal_nature_of_work.nature_of_work,
        date_timestamp: sal_nature_of_work.date_timestamp,
        fk_user_id: sal_nature_of_work.fk_user_id,
        last_status: sal_nature_of_work.last_status,
        username: appUser.username,
      })
      .from(sal_nature_of_work)
      .leftJoin(appUser, eq(sal_nature_of_work.fk_user_id, appUser.pk_user_id))
      .where(and(...conditions))
      .orderBy(sal_nature_of_work.nature_of_work);

    return { success: true, data: rows as NatureOfWorkRow[] };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
};

// ─── get by id ────────────────────────────────────────────────────────────────

export const getNatureOfWorkById = async (
  pk_nw_id: number,
): Promise<ApiResponse<NatureOfWorkRow | null>> => {
  try {
    const rows = await db
      .select({
        pk_nw_id: sal_nature_of_work.pk_nw_id,
        nature_of_work: sal_nature_of_work.nature_of_work,
        date_timestamp: sal_nature_of_work.date_timestamp,
        fk_user_id: sal_nature_of_work.fk_user_id,
        last_status: sal_nature_of_work.last_status,
        username: appUser.username,
      })
      .from(sal_nature_of_work)
      .leftJoin(appUser, eq(sal_nature_of_work.fk_user_id, appUser.pk_user_id))
      .where(eq(sal_nature_of_work.pk_nw_id, pk_nw_id))
      .limit(1);

    const row = rows[0] ?? null;
    return { success: true, data: row as NatureOfWorkRow | null };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
};

// ─── check duplicate ──────────────────────────────────────────────────────────

export const isDuplicateNatureOfWork = async (
  nature_of_work: string,
  excludeId?: number,
): Promise<boolean> => {
  const conditions: SQL[] = [ilike(sal_nature_of_work.nature_of_work, nature_of_work.trim())];

  if (excludeId !== undefined) {
    conditions.push(ne(sal_nature_of_work.pk_nw_id, excludeId));
  }

  const rows = await db
    .select({ pk_nw_id: sal_nature_of_work.pk_nw_id })
    .from(sal_nature_of_work)
    .where(and(...conditions))
    .limit(1);

  return rows.length > 0;
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createNatureOfWork = async (
  input: CreateNatureOfWorkInput,
): Promise<ApiResponse<NatureOfWorkRow>> => {
  try {
    const duplicate = await isDuplicateNatureOfWork(input.nature_of_work);
    if (duplicate) {
      return {
        success: false,
        message: `${input.nature_of_work} already exists.`,
      };
    }

    const [created] = await db
      .insert(sal_nature_of_work)
      .values({
        nature_of_work: input.nature_of_work.trim(),
        fk_user_id: input.fk_user_id,
        last_status: 'Added',
        date_timestamp: new Date(),
      })
      .returning();

    if (!created) {
      return { success: false, message: 'Failed to create nature of work record' };
    }

    const result = await getNatureOfWorkById(created.pk_nw_id);
    if (!result.success) {
      return { success: false, message: result.message };
    }
    if (!result.data) {
      return { success: false, message: 'Failed to retrieve created record' };
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateNatureOfWork = async (
  input: UpdateNatureOfWorkInput,
): Promise<ApiResponse<NatureOfWorkRow>> => {
  try {
    const duplicate = await isDuplicateNatureOfWork(input.nature_of_work, input.pk_nw_id);
    if (duplicate) {
      return {
        success: false,
        message: `${input.nature_of_work} already exists.`,
      };
    }

    const [updated] = await db
      .update(sal_nature_of_work)
      .set({
        nature_of_work: input.nature_of_work.trim(),
        fk_user_id: input.fk_user_id,
        last_status: 'Edited',
        date_timestamp: new Date(),
      })
      .where(eq(sal_nature_of_work.pk_nw_id, input.pk_nw_id))
      .returning();

    if (!updated) {
      return { success: false, message: 'Failed to update record.' };
    }

    const result = await getNatureOfWorkById(updated.pk_nw_id);
    if (!result.success) {
      return { success: false, message: result.message };
    }
    if (!result.data) {
      return { success: false, message: 'Failed to retrieve updated record' };
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteNatureOfWork = async (
  input: DeleteNatureOfWorkInput,
): Promise<ApiResponse<{ pk_nw_id: number }>> => {
  try {
    const record = await db
      .select({
        nature_of_work: sal_nature_of_work.nature_of_work,
      })
      .from(sal_nature_of_work)
      .where(eq(sal_nature_of_work.pk_nw_id, input.pk_nw_id))
      .limit(1);

    if (record.length === 0) {
      return { success: false, message: 'Record not found.' };
    }

    await db.delete(sal_nature_of_work).where(eq(sal_nature_of_work.pk_nw_id, input.pk_nw_id));

    return { success: true, data: { pk_nw_id: input.pk_nw_id } };
  } catch (err) {
    // FK constraint → related data guard
    const msg = (err as Error).message;
    if (msg.includes('foreign key') || msg.includes('violates')) {
      return {
        success: false,
        message: "Selected record can't be deleted because it is related to other data.",
      };
    }
    return { success: false, message: msg };
  }
};
