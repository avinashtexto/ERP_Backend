// src/modules/hr-announcement/hr-announcement.service.ts
import { eq, and, between, gte, lte, not, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  hr_announcement,
  hr_emp_announcement,
  hr_notice_type,
} from "../../shared/database/schemas/hr-announcement.schema.js";
import { hr_notification } from "../../shared/database/schemas/hr_notification.schema.js";
import { temp_table } from "../../shared/database/schemas/temp_table.schema.js";
import { appUser } from "../../shared/database/schemas/app-user.schema.js";
import { sal_employee, sal_structure, file_metadata } from "../../shared/database/schemas/index.js";

import type {
  HrAnnouncementListRow,
  ServiceResult,
  AnnouncementListFilter,
  PaginationParams,
  HrAnnouncement,
  HrNoticeType,
  NewHrAnnouncement,
  NewHrEmpAnnouncement,
  NewHrNotification,
} from "./hr-announcement.types.js";

import type {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AuthorizeAnnouncementDto,
  DeleteAnnouncementDto,
  CreateNoticeTypeDto,
} from "./hr-announcement.dto.js";

// ---------------------------------------------------------------------------
// Private helpers (hoisted to the top)
// ---------------------------------------------------------------------------
const _build_notif_text = (
  dto: Pick<
    CreateAnnouncementDto,
    "ref_no" | "ref_date" | "announcement"
  > & { type?: string }
): string =>
  `Reference No.: ${dto.ref_no}; Reference Date: ${
    dto.ref_date?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) ?? ""
  }; Type: ${dto.type ?? ""}; Announcement & Notice: ${dto.announcement}`;

// ---------------------------------------------------------------------------
// Helper: build a ServiceResult from a caught error
// ---------------------------------------------------------------------------
const to_error = (err: unknown): ServiceResult<never> => ({
  ok: false,
  error: err instanceof Error ? err.message : String(err),
});

// ---------------------------------------------------------------------------
// get_path_settings
// Reads FTP / shared-drive paths from temp_table (IDs 3011, 5001, 5004).
// ---------------------------------------------------------------------------
export const get_path_settings = async (
  db: NodePgDatabase<any>
): Promise<ServiceResult<{ sa_path: string; ftp_path: string }>> => {
  try {
    const rowsResult = await db
      .select()
      .from(temp_table)
      .where(
        sql`CAST(${temp_table.id} AS integer) IN (3011, 5001, 5004)`
      )
      .orderBy(temp_table.id);

    const rows = rowsResult;
    if (rows.length < 3)
      return { ok: false, error: "Path settings not found in temp_table." };

    const ftp_base = rows[0]?.temp_fields;
    const sa_path = rows[1]?.temp_fields;
    const ftp_sub = rows[2]?.temp_fields;

    if (!ftp_base || !sa_path || !ftp_sub)
      return { ok: false, error: "Path settings fields not found in temp_table." };

    return { ok: true, data: { sa_path, ftp_path: ftp_base + ftp_sub } };
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// list_announcements
// Mirrors the FillList() query with dynamic WHERE clauses.
// ---------------------------------------------------------------------------
export const list_announcements = async (
  db: NodePgDatabase<any>,
  filter: AnnouncementListFilter,
  pagination: PaginationParams
): Promise<ServiceResult<{ rows: HrAnnouncementListRow[]; total: number }>> => {
  try {
    const conditions: ReturnType<typeof sql>[] = [];

    // Date range on ref_date is always applied
    if (filter.from_ref_date && filter.to_ref_date) {
      conditions.push(
        sql`${hr_announcement.ref_date} BETWEEN ${filter.from_ref_date} AND ${filter.to_ref_date}`
      );
    }

    if (filter.ref_no)
      conditions.push(
        sql`${hr_announcement.ref_no} ILIKE ${filter.ref_no + "%"}`
      );

    if (filter.announcement)
      conditions.push(
        sql`${hr_announcement.announcement} ILIKE ${filter.announcement + "%"}`
      );

    if (filter.last_status)
      conditions.push(
        sql`${hr_announcement.last_status} ILIKE ${filter.last_status + "%"}`
      );

    if (filter.own_record && filter.fk_user_id)
      conditions.push(
        eq(hr_announcement.fk_user_id, filter.fk_user_id)
      );

    if (filter.from_timestamp && filter.to_timestamp)
      conditions.push(
        between(
          hr_announcement.date_timestamp,
          filter.from_timestamp,
          filter.to_timestamp
        )
      );
    else if (filter.from_timestamp)
      conditions.push(gte(hr_announcement.date_timestamp, filter.from_timestamp));
    else if (filter.to_timestamp)
      conditions.push(lte(hr_announcement.date_timestamp, filter.to_timestamp));

    if (filter.from_a_timestamp && filter.to_a_timestamp)
      conditions.push(
        sql`${hr_announcement.a_timestamp} BETWEEN ${filter.from_a_timestamp} AND ${filter.to_a_timestamp}`
      );
    else if (filter.from_a_timestamp)
      conditions.push(gte(hr_announcement.a_timestamp as any, filter.from_a_timestamp));
    else if (filter.to_a_timestamp)
      conditions.push(lte(hr_announcement.a_timestamp as any, filter.to_a_timestamp));

    const where_clause =
      conditions.length > 0
        ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
        : sql`TRUE`;

    // Main list query — joins notice type + user lookup via raw SQL for
    // simplicity (mirrors the original SELECT with CASE expressions).
    const resultRows = await db.execute<HrAnnouncementListRow>(sql`
      SELECT
        ha.pk_an_id,
        ha.ref_no,
        ha.ref_date,
        ha.fk_nt_id,
        hnt.type,
        ha.announcement,
        ha.file_name,
        ha.sys_defined,
        ha.date_timestamp,
        ha.fk_user_id,
        ha.last_status,
        CASE
          WHEN ha.sys_defined = TRUE
            THEN COALESCE(au.username, 'Application')
          ELSE au.username
        END AS username,
        ha.authorize,
        ha.a_timestamp,
        ha.fk_a_user_id,
        au2.username AS a_user
      FROM hr_announcement ha
      LEFT JOIN hr_notice_type hnt ON ha.fk_nt_id = hnt.pk_nt_id
      LEFT JOIN app_user au        ON ha.fk_user_id::integer  = au.pk_user_id
      LEFT JOIN app_user au2       ON ha.fk_a_user_id::integer = au2.pk_user_id
      WHERE ${where_clause}
      ORDER BY ha.authorize, ha.ref_date, ha.ref_no
      LIMIT  ${pagination.page_size}
      OFFSET ${(pagination.page - 1) * pagination.page_size}
    `);

    const rows = resultRows.rows as unknown as HrAnnouncementListRow[];

    const countResult = await db.execute<{ count: string }>(sql`
      SELECT COUNT(*) AS count
      FROM hr_announcement ha
      WHERE ${where_clause}
    `);

    const [{ count }] = countResult.rows as unknown as [{ count: string }];

    return {
      ok: true,
      data: { rows, total: Number(count) },
    };
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// get_announcement_by_id
// ---------------------------------------------------------------------------
export const get_announcement_by_id = async (
  db: NodePgDatabase<any>,
  pk_an_id: number
): Promise<ServiceResult<HrAnnouncement>> => {
  try {
    const [row] = await db
      .select()
      .from(hr_announcement)
      .where(eq(hr_announcement.pk_an_id, pk_an_id));

    if (!row) return { ok: false, error: `Announcement ${pk_an_id} not found.` };
    return { ok: true, data: row };
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// create_announcement
// Wraps the insert + employee mapping + notification write in a transaction.
// ---------------------------------------------------------------------------
export const create_announcement = async (
  db: NodePgDatabase<any>,
  dto: CreateAnnouncementDto
): Promise<ServiceResult<HrAnnouncement>> => {
  try {
    return await db.transaction(async (tx) => {
      const now = new Date();

      const [inserted] = await tx
        .insert(hr_announcement)
        .values({
          ref_no: dto.ref_no,
          ref_date: dto.ref_date,
          fk_nt_id: dto.fk_nt_id ?? null,
          announcement: dto.announcement,
          file_name: dto.file_name,
          sys_defined: false,
          date_timestamp: now,
          fk_user_id: dto.fk_user_id,
          last_status: "Added",
          authorize: dto.authorize,
          a_timestamp: dto.authorize ? now : null,
          fk_a_user_id: dto.authorize ? (dto.fk_a_user_id ?? null) : null,
          sync: "N",
        } satisfies NewHrAnnouncement)
        .returning();

      if (!inserted) {
        throw new Error("Failed to create announcement row");
      }

      // Insert employee → announcement mapping rows
      if (dto.employee_ss_ids.length > 0) {
        const emp_rows: NewHrEmpAnnouncement[] = dto.employee_ss_ids.map(
          (fk_ss_id) => ({ fk_an_id: inserted.pk_an_id, fk_ss_id })
        );
        await tx.insert(hr_emp_announcement).values(emp_rows);
      }

      // Link attachments (file_metadata)
      if (dto.file_name) {
        await tx
          .update(file_metadata)
          .set({ announcement_id: inserted.pk_an_id })
          .where(
            and(
              eq(file_metadata.file_name, dto.file_name),
              sql`${file_metadata.announcement_id} IS NULL`
            )
          );
      }

      // Write notification audit row
      await tx.insert(hr_notification).values({
        not_date: now,
        form_name: "Announcement and Notice",
        announcement: _build_notif_text(dto),
        file_name: dto.file_name,
        n_id: inserted.pk_an_id,
        edit_mode: 0,   // 0 = Add
        fk_user_id: Number(dto.fk_user_id),
        fk_set_id: null,
        authorize: dto.authorize,
      } satisfies NewHrNotification);

      return { ok: true, data: inserted as HrAnnouncement };
    });
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// update_announcement
// ---------------------------------------------------------------------------
export const update_announcement = async (
  db: NodePgDatabase<any>,
  dto: UpdateAnnouncementDto
): Promise<ServiceResult<HrAnnouncement>> => {
  try {
    return await db.transaction(async (tx) => {
      const now = new Date();

      const updateData: any = {
        date_timestamp: now,
        last_status: "Edited",
      };

      if (dto.ref_no !== undefined) updateData.ref_no = dto.ref_no;
      if (dto.ref_date !== undefined) updateData.ref_date = dto.ref_date;
      if (dto.fk_nt_id !== undefined) updateData.fk_nt_id = dto.fk_nt_id ?? null;
      if (dto.announcement !== undefined) updateData.announcement = dto.announcement;
      if (dto.file_name !== undefined) updateData.file_name = dto.file_name;
      if (dto.fk_user_id !== undefined) updateData.fk_user_id = dto.fk_user_id;

      if (dto.authorize !== undefined) {
        updateData.authorize = dto.authorize;
        updateData.a_timestamp = dto.authorize ? now : null;
        if (dto.fk_a_user_id !== undefined) {
          updateData.fk_a_user_id = dto.authorize ? (dto.fk_a_user_id ?? null) : null;
        }
      }

      const [updated] = await tx
        .update(hr_announcement)
        .set(updateData)
        .where(eq(hr_announcement.pk_an_id, dto.pk_an_id!))
        .returning();

      if (!updated)
        throw new Error(`Announcement ${dto.pk_an_id} not found for update.`);

      // Link attachments (file_metadata) if file_name is updated and provided
      if (dto.file_name) {
        await tx
          .update(file_metadata)
          .set({ announcement_id: updated.pk_an_id })
          .where(
            and(
              eq(file_metadata.file_name, dto.file_name),
              sql`${file_metadata.announcement_id} IS NULL`
            )
          );
      }

      // Replace employee mapping: delete existing, re-insert selected
      if (dto.employee_ss_ids && dto.employee_ss_ids.length > 0) {
        const keep_ids = dto.employee_ss_ids;
        await tx
          .delete(hr_emp_announcement)
          .where(
            and(
              eq(hr_emp_announcement.fk_an_id, dto.pk_an_id!),
              not(sql`${hr_emp_announcement.fk_ss_id} = ANY(${keep_ids})`)
            )
          );

        // Insert only those not yet linked
        const existing = await tx
          .select({ fk_ss_id: hr_emp_announcement.fk_ss_id })
          .from(hr_emp_announcement)
          .where(eq(hr_emp_announcement.fk_an_id, dto.pk_an_id!));

        const existing_ids = new Set(existing.map((r) => r.fk_ss_id));
        const new_rows: NewHrEmpAnnouncement[] = keep_ids
          .filter((id) => !existing_ids.has(id))
          .map((fk_ss_id) => ({ fk_an_id: dto.pk_an_id!, fk_ss_id }));

        if (new_rows.length > 0)
          await tx.insert(hr_emp_announcement).values(new_rows);
      }

      // Replace notification row
      await tx
        .delete(hr_notification)
        .where(
          and(
            eq(hr_notification.form_name, "Announcement and Notice"),
            eq(hr_notification.n_id, dto.pk_an_id!)
          )
        );

      await tx.insert(hr_notification).values({
        not_date: now,
        form_name: "Announcement and Notice",
        announcement: _build_notif_text({
          ref_no: updated.ref_no,
          ref_date: updated.ref_date,
          announcement: updated.announcement,
          ...dto,
        } as any),
        file_name: updated.file_name ?? "",
        n_id: dto.pk_an_id,
        edit_mode: 1,   // 1 = Edit
        fk_user_id: Number(updated.fk_user_id),
        fk_set_id: null,
        authorize: updated.authorize,
      } satisfies NewHrNotification);

      return { ok: true, data: updated as HrAnnouncement };
    });
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// delete_announcement
// ---------------------------------------------------------------------------
export const delete_announcement = async (
  db: NodePgDatabase<any>,
  dto: DeleteAnnouncementDto,
  fk_user_id: string
): Promise<ServiceResult<{ pk_an_id: number }>> => {
  try {
    return await db.transaction(async (tx) => {
      // Delete child rows first
      await tx
        .delete(hr_emp_announcement)
        .where(eq(hr_emp_announcement.fk_an_id, dto.pk_an_id));

      const [deleted] = await tx
        .delete(hr_announcement)
        .where(eq(hr_announcement.pk_an_id, dto.pk_an_id))
        .returning({ pk_an_id: hr_announcement.pk_an_id });

      if (!deleted)
        return {
          ok: false,
          error: `Announcement ${dto.pk_an_id} not found for deletion.`,
        };

      // Replace notification with delete audit
      const now = new Date();

      await tx
        .delete(hr_notification)
        .where(
          and(
            eq(hr_notification.form_name, "Announcement and Notice"),
            eq(hr_notification.n_id, dto.pk_an_id)
          )
        );

      await tx.insert(hr_notification).values({
        not_date: now,
        form_name: "Announcement and Notice",
        announcement: `Reference No.: ${dto.ref_no}`,
        file_name: "",
        n_id: dto.pk_an_id,
        edit_mode: 2,   // 2 = Delete
        fk_user_id: Number(fk_user_id),
        fk_set_id: null,
      } satisfies NewHrNotification);

      return { ok: true, data: { pk_an_id: deleted.pk_an_id } };
    });
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// authorize_announcement
// ---------------------------------------------------------------------------
export const authorize_announcement = async (
  db: NodePgDatabase<any>,
  dto: AuthorizeAnnouncementDto
): Promise<ServiceResult<HrAnnouncement>> => {
  try {
    return await db.transaction(async (tx) => {
      const [current] = await tx
        .select({ authorize: hr_announcement.authorize })
        .from(hr_announcement)
        .where(eq(hr_announcement.pk_an_id, dto.pk_an_id));

      if (!current)
        return { ok: false, error: "Announcement not found." };

      if (current.authorize)
        return {
          ok: false,
          error: `Announcement is already authorized by ${dto.a_user_name}.`,
        };

      const now = new Date();
      const [updated] = await tx
        .update(hr_announcement)
        .set({
          authorize: true,
          a_timestamp: now,
          fk_a_user_id: dto.fk_a_user_id,
          last_status: "Authorized",
        })
        .where(eq(hr_announcement.pk_an_id, dto.pk_an_id))
        .returning();

      if (!updated) {
        throw new Error("Failed to authorize announcement");
      }

      return { ok: true, data: updated as HrAnnouncement };
    });
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// list_notice_types
// ---------------------------------------------------------------------------
export const list_notice_types = async (
  db: NodePgDatabase<any>
): Promise<ServiceResult<HrNoticeType[]>> => {
  try {
    const rows = await db
      .select()
      .from(hr_notice_type)
      .orderBy(hr_notice_type.type);

    return { ok: true, data: rows };
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// create_notice_type
// ---------------------------------------------------------------------------
export const create_notice_type = async (
  db: NodePgDatabase<any>,
  dto: CreateNoticeTypeDto
): Promise<ServiceResult<HrNoticeType>> => {
  try {
    const [row] = await db
      .insert(hr_notice_type)
      .values({ type: dto.type })
      .returning();

    if (!row) {
      return { ok: false, error: "Failed to create notice type" };
    }
    return { ok: true, data: row as HrNoticeType };
  } catch (err) {
    return to_error(err);
  }
};

// ---------------------------------------------------------------------------
// Backward compatibility adapters for test module
// ---------------------------------------------------------------------------
import { db as globalDb } from "../../config/db.config.js";

// ---------------------------------------------------------------------------
// get_employees_for_announcement
// ---------------------------------------------------------------------------
export const get_employees_for_announcement = async (
  db: NodePgDatabase<any>,
  ref_date: Date,
  pk_an_id: number | null
): Promise<
  ServiceResult<
    {
      pk_ss_id: number;
      employee: string;
      emp_code: string;
      selected: boolean;
    }[]
  >
> => {
  try {
    const all_employees = await db
      .select({
        pk_ss_id: sal_structure.pk_ss_id,
        employee: sal_employee.employee,
        emp_code: sal_employee.emp_code,
      })
      .from(sal_structure)
      .innerJoin(sal_employee, eq(sal_structure.fk_emp_id, sal_employee.pk_emp_id));

    const selected_ss_ids = new Set<number>();
    if (pk_an_id) {
      const selected = await db
        .select({ fk_ss_id: hr_emp_announcement.fk_ss_id })
        .from(hr_emp_announcement)
        .where(eq(hr_emp_announcement.fk_an_id, pk_an_id));

      for (const row of selected) {
        selected_ss_ids.add(row.fk_ss_id);
      }
    }

    const data = all_employees.map((emp) => ({
      pk_ss_id: Number(emp.pk_ss_id),
      employee: emp.employee ?? "",
      emp_code: emp.emp_code ?? "",
      selected: selected_ss_ids.has(Number(emp.pk_ss_id)),
    }));

    return { ok: true, data };
  } catch (err) {
    return to_error(err);
  }
};


export const createNoticeType = async (dto: any) => {
  const res = await create_notice_type(globalDb as any, dto);
  if (!res.ok) throw new Error(res.error);
  return res.data;
};

export const listNoticeTypes = async () => {
  const res = await list_notice_types(globalDb as any);
  if (!res.ok) throw new Error(res.error);
  return res.data;
};

export const createAnnouncement = async (dto: any, creatorUserId: number) => {
  const mappedDto = {
    ref_no: dto.ref_no,
    ref_date: dto.ref_date,
    fk_nt_id: dto.fk_nt_id,
    announcement: dto.announcement,
    file_name: dto.file_name ?? '',
    fk_user_id: String(creatorUserId),
    employee_ss_ids: (dto.target_ss_ids || []).map((id: any) => Number(id)),
    authorize: dto.authorize ?? false,
    fk_a_user_id: dto.fk_a_user_id ? String(dto.fk_a_user_id) : undefined,
  };
  const res = await create_announcement(globalDb as any, mappedDto as any);
  if (!res.ok) throw new Error(res.error);
  return res.data;
};

export const getAnnouncementById = async (id: number) => {
  const result = await get_announcement_by_id(globalDb as any, id);
  if (!result.ok) return null;
  const ann = result.data;

  // Fetch notice type
  const [nt] = await globalDb
    .select()
    .from(hr_notice_type)
    .where(eq(hr_notice_type.pk_nt_id, ann.fk_nt_id!))
    .limit(1);

  // Fetch mappings
  const mappings = await globalDb
    .select({
      pk_ss_id: sal_structure.pk_ss_id,
      employeeName: sal_employee.employee,
      empCode: sal_employee.emp_code,
    })
    .from(hr_emp_announcement)
    .innerJoin(sal_structure, eq(hr_emp_announcement.fk_ss_id, sal_structure.pk_ss_id))
    .innerJoin(sal_employee, eq(sal_structure.fk_emp_id, sal_employee.pk_emp_id))
    .where(eq(hr_emp_announcement.fk_an_id, id));

  // Fetch attachments
  const attachments = await globalDb
    .select()
    .from(file_metadata)
    .where(eq(file_metadata.announcement_id, id));

  return {
    ...ann,
    notice_type: nt ?? ({} as any),
    targetEmployeeStructures: mappings,
    attachments,
  };
};

export const listAnnouncements = async (filters: any) => {
  const pagination = {
    page: filters.page ?? 1,
    page_size: filters.limit ?? 50,
  };
  const listFilters: AnnouncementListFilter = {
    fk_user_id: filters.fk_user_id ? String(filters.fk_user_id) : undefined,
    type: filters.type,
    announcement: filters.search,
  };
  if (filters.from_date) listFilters.from_ref_date = filters.from_date;
  if (filters.to_date) listFilters.to_ref_date = filters.to_date;
  if (filters.fk_nt_id) {
    const [nt] = await globalDb
      .select({ type: hr_notice_type.type })
      .from(hr_notice_type)
      .where(eq(hr_notice_type.pk_nt_id, filters.fk_nt_id))
      .limit(1);
    if (nt) {
      listFilters.type = nt.type;
    }
  }

  const res = await list_announcements(globalDb as any, listFilters, pagination);
  if (!res.ok) throw new Error(res.error);

  return {
    data: res.data.rows,
    pagination: {
      page: pagination.page,
      limit: pagination.page_size,
      total: res.data.total,
      pages: Math.ceil(res.data.total / pagination.page_size),
    },
  };
};

export const updateAnnouncement = async (id: number, dto: any) => {
  const mappedDto = {
    pk_an_id: id,
    ref_no: dto.ref_no,
    ref_date: dto.ref_date,
    fk_nt_id: dto.fk_nt_id,
    announcement: dto.announcement,
    file_name: dto.file_name,
    employee_ss_ids: dto.target_ss_ids ? dto.target_ss_ids.map((ssId: any) => Number(ssId)) : undefined,
    authorize: dto.authorize,
    fk_a_user_id: dto.fk_a_user_id ? String(dto.fk_a_user_id) : undefined,
  };
  const res = await update_announcement(globalDb as any, mappedDto as any);
  if (!res.ok) throw new Error(res.error);
  return res.data;
};

export const authorizeAnnouncement = async (id: number, authorizerUserId: number) => {
  // Get authorizer user name
  const [user] = await globalDb
    .select({ username: appUser.username })
    .from(appUser)
    .where(eq(appUser.pk_user_id, authorizerUserId))
    .limit(1);

  const dto: AuthorizeAnnouncementDto = {
    pk_an_id: id,
    fk_a_user_id: String(authorizerUserId),
    a_user_name: user?.username ?? 'System',
  };
  const res = await authorize_announcement(globalDb as any, dto);
  if (!res.ok) throw new Error(res.error);
  return res.data;
};
