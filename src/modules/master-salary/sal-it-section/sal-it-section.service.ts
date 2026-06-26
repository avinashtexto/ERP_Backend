// ─── sal-it-section.service.ts ──────────────────────────────────────────────
import { eq, ilike, sql, and, ne, type SQL } from 'drizzle-orm';

import type {
  CreateSalItSectionInput,
  UpdateSalItSectionInput,
  DeleteSalItSectionInput,
} from './sal-it-section.dto.js';
import type {
  SalItSectionRow,
  SalItSectionListFilter,
  ApiResponse,
} from './sal-it-section.types.js';

import { db } from '@/config/db.config.js';
import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { sal_it_section } from '@/shared/database/schemas/sal-it-section.schema.js';

const buildListConditions = (filter: SalItSectionListFilter): SQL[] => {
  const conditions: SQL[] = [];

  if (filter.it_section) {
    conditions.push(ilike(sal_it_section.it_section, `${filter.it_section}%`));
  }
  if (filter.last_status) {
    conditions.push(ilike(sal_it_section.last_status, `${filter.last_status}%`));
  }
  if (filter.additraction) {
    conditions.push(eq(sal_it_section.additraction, filter.additraction));
  }
  if (filter.date_timestamp) {
    conditions.push(sql`${sal_it_section.date_time_stamp}::date = ${filter.date_timestamp}::date`);
  }
  return conditions;
};

export const listItSections = async (
  filter: SalItSectionListFilter,
): Promise<ApiResponse<SalItSectionRow[]>> => {
  try {
    const conditions = buildListConditions(filter);

    if (filter.username) {
      conditions.push(ilike(appUser.username, `${filter.username}%`));
    }

    const rows = await db
      .select({
        pk_sec_id: sal_it_section.pk_sec_id,
        it_section: sal_it_section.it_section,
        deduction: sal_it_section.deduction,
        fk_fy_id: sal_it_section.fk_fy_id,
        date_time_stamp: sal_it_section.date_time_stamp,
        fk_user_id: sal_it_section.fk_user_id,
        last_status: sal_it_section.last_status,
        additraction: sal_it_section.additraction,
        username: appUser.username,
      })
      .from(sal_it_section)
      .leftJoin(appUser, eq(sal_it_section.fk_user_id, appUser.pk_user_id))
      .where(and(...conditions))
      .orderBy(sal_it_section.it_section);

    return { success: true, data: rows as SalItSectionRow[] };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
};

export const getItSectionById = async (
  pk_sec_id: number,
): Promise<ApiResponse<SalItSectionRow | null>> => {
  try {
    const rows = await db
      .select({
        pk_sec_id: sal_it_section.pk_sec_id,
        it_section: sal_it_section.it_section,
        deduction: sal_it_section.deduction,
        fk_fy_id: sal_it_section.fk_fy_id,
        date_time_stamp: sal_it_section.date_time_stamp,
        fk_user_id: sal_it_section.fk_user_id,
        last_status: sal_it_section.last_status,
        additraction: sal_it_section.additraction,
        username: appUser.username,
      })
      .from(sal_it_section)
      .leftJoin(appUser, eq(sal_it_section.fk_user_id, appUser.pk_user_id))
      .where(eq(sal_it_section.pk_sec_id, pk_sec_id))
      .limit(1);

    const row = rows[0] ?? null;
    return { success: true, data: row as SalItSectionRow | null };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
};

export const isDuplicateItSection = async (
  it_section: string,
  excludeId?: number,
): Promise<boolean> => {
  const conditions: SQL[] = [ilike(sal_it_section.it_section, it_section.trim())];

  if (excludeId !== undefined) {
    conditions.push(ne(sal_it_section.pk_sec_id, excludeId));
  }

  const rows = await db
    .select({ pk_sec_id: sal_it_section.pk_sec_id })
    .from(sal_it_section)
    .where(and(...conditions))
    .limit(1);

  return rows.length > 0;
};

export const createItSection = async (
  input: CreateSalItSectionInput,
): Promise<ApiResponse<SalItSectionRow>> => {
  try {
    const duplicate = await isDuplicateItSection(input.it_section);
    if (duplicate) {
      return {
        success: false,
        message: `${input.it_section} already exists.`,
      };
    }

    const [created] = await db
      .insert(sal_it_section)
      .values({
        it_section: input.it_section.trim(),
        deduction: input.deduction || null,
        fk_fy_id: input.fk_fy_id || null,
        fk_user_id: input.fk_user_id,
        additraction: input.additraction,
        last_status: 'Added',
        date_time_stamp: new Date(),
      })
      .returning();

    if (!created) {
      return { success: false, message: 'Failed to create IT section record' };
    }

    const result = await getItSectionById(created.pk_sec_id);
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

export const updateItSection = async (
  input: UpdateSalItSectionInput,
): Promise<ApiResponse<SalItSectionRow>> => {
  try {
    if (input.it_section) {
      const duplicate = await isDuplicateItSection(input.it_section, input.pk_sec_id);
      if (duplicate) {
        return {
          success: false,
          message: `${input.it_section} already exists.`,
        };
      }
    }

    const existing = await db
      .select({ pk_sec_id: sal_it_section.pk_sec_id })
      .from(sal_it_section)
      .where(eq(sal_it_section.pk_sec_id, input.pk_sec_id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, message: 'Record not found.' };
    }

    const [updated] = await db
      .update(sal_it_section)
      .set({
        ...(input.it_section && { it_section: input.it_section.trim() }),
        ...(input.deduction !== undefined && { deduction: input.deduction }),
        ...(input.fk_fy_id !== undefined && { fk_fy_id: input.fk_fy_id }),
        ...(input.additraction && { additraction: input.additraction }),
        fk_user_id: input.fk_user_id,
        last_status: 'Edited',
        date_time_stamp: new Date(),
      })
      .where(eq(sal_it_section.pk_sec_id, input.pk_sec_id))
      .returning();

    if (!updated) {
      return { success: false, message: 'Failed to update record.' };
    }

    const result = await getItSectionById(updated.pk_sec_id);
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

export const deleteItSection = async (
  input: DeleteSalItSectionInput,
): Promise<ApiResponse<{ pk_sec_id: number }>> => {
  try {
    const record = await db
      .select({
        it_section: sal_it_section.it_section,
      })
      .from(sal_it_section)
      .where(eq(sal_it_section.pk_sec_id, input.pk_sec_id))
      .limit(1);

    if (record.length === 0) {
      return { success: false, message: 'Record not found.' };
    }

    await db.delete(sal_it_section).where(eq(sal_it_section.pk_sec_id, input.pk_sec_id));

    return { success: true, data: { pk_sec_id: input.pk_sec_id } };
  } catch (err) {
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

export async function health(): Promise<any> {
  return { status: 'UP' };
}
