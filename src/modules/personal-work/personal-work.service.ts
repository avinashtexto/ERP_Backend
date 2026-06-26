import { db } from "../../config/db.config.js";
import { and, between, desc, eq, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { salPersonalWork } from "../../shared/database/schemas/sal-personal-work.schema.js";
import { salEmployee } from "../../shared/database/schemas/index.js";
import { appUser } from "../../shared/database/schemas/app-user.schema.js";
import { sal_shift_timing } from "../../shared/database/schemas/sal_shift_timing.schema.js";
import type {
  CreatePersonalWorkDtoType,
  AuthorizePersonalWorkDtoType,
  PersonalWorkFilterDtoType,
} from "./personal-work.dto.js";
import type {
  PersonalWorkListRow,
  PaginatedResult,
} from "./personal-work.types.js";

const creatorUser = alias(appUser, "creator_user");
const authorizerUser = alias(appUser, "authorizer_user");

// ─────────────────────────────────────────────────────────────
// HELPER: Get employee's shift end time
// ─────────────────────────────────────────────────────────────

export async function getEmployeeShiftEndTime(
  fk_emp_id: number
): Promise<{ e_work: Date; shift: string } | null> {
  const [emp] = await db
    .select({ fk_st_id: salEmployee.fk_st_id })
    .from(salEmployee)
    .where(eq(salEmployee.pk_emp_id, fk_emp_id))
    .limit(1);

  if (!emp?.fk_st_id) {
    // If no shift ID is set, return default shift time (9:30 AM - 6:30 PM)
    const defaultShiftEnd = new Date();
    defaultShiftEnd.setHours(18, 30, 0, 0); // 6:30 PM
    return { e_work: defaultShiftEnd, shift: 'General' };
  }

  const [shift] = await db
    .select({ e_work: sal_shift_timing.e_work, shift: sal_shift_timing.shift })
    .from(sal_shift_timing)
    .where(eq(sql`CAST(${sal_shift_timing.pk_st_id} AS numeric)`, emp.fk_st_id))
    .limit(1);

  if (!shift) {
    // If shift timing not found, return default shift time
    const defaultShiftEnd = new Date();
    defaultShiftEnd.setHours(18, 30, 0, 0); // 6:30 PM
    return { e_work: defaultShiftEnd, shift: 'General' };
  }

  return shift;
}

export async function createPersonalWorkRequest(
  dto: CreatePersonalWorkDtoType,
  fk_user_id: number
): Promise<number> {
  const leavingTime = new Date(dto.leaving_time);
  const returnTime = new Date(dto.return_time);

  // ── Shift-end validation ──────────────────────────────────────────────────
  // Fetch employee's shift end time from sal_shift_timing via fk_st_id
  const shiftInfo = await getEmployeeShiftEndTime(dto.fk_emp_id);
  if (shiftInfo) {
    // e_work is stored as a full timestamp but only the time part matters.
    // Build a comparison time on the same date as the request.
    const eWork = new Date(shiftInfo.e_work);
    const shiftEnd = new Date(dto.request_date);
    shiftEnd.setHours(eWork.getHours(), eWork.getMinutes(), 0, 0);

    // The return time must be strictly BEFORE the shift end time.
    // e.g. shift ends 18:00 → return must be ≤ 17:59
    if (returnTime >= shiftEnd) {
      const shiftEndFormatted = eWork.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      throw new Error(
        `Return time must be before shift end time (${shiftEndFormatted}). Personal work cannot extend to or beyond working hours end.`
      );
    }
  }

  let breakDurationMs = returnTime.getTime() - leavingTime.getTime();
  if (breakDurationMs < 0) breakDurationMs += 24 * 60 * 60 * 1000;
  const breakTimeMinutes = Math.floor(breakDurationMs / (1000 * 60));

  const result = await db.insert(salPersonalWork).values({
    request_date: dto.request_date,
    fk_emp_id: dto.fk_emp_id,
    leaving_time: dto.leaving_time,
    return_time: dto.return_time,
    break_time: breakTimeMinutes,
    reason: dto.reason,
    remarks: dto.remarks ?? "",
    date_timestamp: new Date(),
    fk_user_id: fk_user_id,
    last_status: "Added",
    authorize: false,
  }).returning({ pk_pw_id: salPersonalWork.pk_pw_id });

  const firstRow = result[0];
  if (!firstRow) throw new Error("Failed to create personal work request");
  return firstRow.pk_pw_id;
}

export async function getPersonalWorkRequests(
  filter: PersonalWorkFilterDtoType,
  currentUserId?: number
): Promise<PaginatedResult<PersonalWorkListRow>> {
  const conditions = [];

  if (filter.from_date && filter.to_date) {
    conditions.push(
      between(salPersonalWork.request_date, new Date(filter.from_date), new Date(filter.to_date))
    );
  }

  if (filter.fk_emp_id) {
    conditions.push(eq(salPersonalWork.fk_emp_id, filter.fk_emp_id));
  }

  if (filter.last_status) {
    conditions.push(ilike(salPersonalWork.last_status, `${filter.last_status}%`));
  }

  // Filter for mobile user - own records only
  if (filter.own_record && currentUserId) {
    conditions.push(eq(salPersonalWork.fk_user_id, currentUserId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (filter.page - 1) * filter.page_size;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        pk_pw_id: sql<number>`CAST(${salPersonalWork.pk_pw_id} AS integer)`,
        request_date: salPersonalWork.request_date,
        fk_emp_id: salPersonalWork.fk_emp_id,
        leaving_time: salPersonalWork.leaving_time,
        return_time: salPersonalWork.return_time,
        break_time: salPersonalWork.break_time,
        reason: salPersonalWork.reason,
        remarks: salPersonalWork.remarks,
        date_timestamp: salPersonalWork.date_timestamp,
        fk_user_id: salPersonalWork.fk_user_id,
        last_status: salPersonalWork.last_status,
        authorize: salPersonalWork.authorize,
        a_timestamp: salPersonalWork.a_timestamp,
        fk_a_user_id: salPersonalWork.fk_a_user_id,
        employee_name: salEmployee.employee,
        emp_code: salEmployee.emp_code,
        user_name: creatorUser.username,
        authorized_by_name: authorizerUser.username,
      })
      .from(salPersonalWork)
      .leftJoin(salEmployee, eq(salEmployee.pk_emp_id, salPersonalWork.fk_emp_id))
      .leftJoin(creatorUser, eq(creatorUser.pk_user_id, salPersonalWork.fk_user_id))
      .leftJoin(authorizerUser, eq(authorizerUser.pk_user_id, salPersonalWork.fk_a_user_id))
      .where(whereClause)
      .orderBy(desc(salPersonalWork.request_date))
      .limit(filter.page_size)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(salPersonalWork)
      .where(whereClause)
  ]);

  const total = Number(countResult[0]?.count || 0);
  const total_pages = Math.ceil(total / filter.page_size);

  return {
    data: rows as PersonalWorkListRow[],
    meta: {
      page: filter.page,
      page_size: filter.page_size,
      total,
      total_pages,
    },
  };
}

export async function getPersonalWorkRequestById(
  id: number
): Promise<PersonalWorkListRow | null> {
  const rows = await db
    .select({
      pk_pw_id: sql<number>`CAST(${salPersonalWork.pk_pw_id} AS integer)`,
      request_date: salPersonalWork.request_date,
      fk_emp_id: salPersonalWork.fk_emp_id,
      leaving_time: salPersonalWork.leaving_time,
      return_time: salPersonalWork.return_time,
      break_time: salPersonalWork.break_time,
      reason: salPersonalWork.reason,
      remarks: salPersonalWork.remarks,
      date_timestamp: salPersonalWork.date_timestamp,
      fk_user_id: salPersonalWork.fk_user_id,
      last_status: salPersonalWork.last_status,
      authorize: salPersonalWork.authorize,
      a_timestamp: salPersonalWork.a_timestamp,
      fk_a_user_id: salPersonalWork.fk_a_user_id,
      employee_name: salEmployee.employee,
      emp_code: salEmployee.emp_code,
      user_name: creatorUser.username,
      authorized_by_name: authorizerUser.username,
    })
    .from(salPersonalWork)
    .leftJoin(salEmployee, eq(salEmployee.pk_emp_id, salPersonalWork.fk_emp_id))
    .leftJoin(creatorUser, eq(creatorUser.pk_user_id, salPersonalWork.fk_user_id))
    .leftJoin(authorizerUser, eq(authorizerUser.pk_user_id, salPersonalWork.fk_a_user_id))
    .where(eq(sql<number>`CAST(${salPersonalWork.pk_pw_id} AS integer)`, id))
    .limit(1);

  return (rows[0] as PersonalWorkListRow) || null;
}

export async function updatePersonalWorkRequest(
  id: number,
  dto: Partial<CreatePersonalWorkDtoType>,
  fk_user_id: number
): Promise<boolean> {
  // Only allow editing non-authorized records
  const [existing] = await db
    .select({ authorize: salPersonalWork.authorize })
    .from(salPersonalWork)
    .where(eq(sql<number>`CAST(${salPersonalWork.pk_pw_id} AS integer)`, id))
    .limit(1);

  if (!existing) throw new Error("Record not found");
  if (existing.authorize) throw new Error("Cannot edit an already authorized request.");

  // Shift-end validation if times are being updated
  if (dto.leaving_time && dto.return_time && dto.fk_emp_id) {
    const shiftInfo = await getEmployeeShiftEndTime(dto.fk_emp_id);
    if (shiftInfo) {
      const eWork = new Date(shiftInfo.e_work);
      const requestDate = dto.request_date ?? new Date();
      const shiftEnd = new Date(requestDate);
      shiftEnd.setHours(eWork.getHours(), eWork.getMinutes(), 0, 0);
      const returnTime = new Date(dto.return_time);
      if (returnTime >= shiftEnd) {
        const shiftEndFormatted = eWork.toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', hour12: true,
        });
        throw new Error(
          `Return time must be before shift end time (${shiftEndFormatted}).`
        );
      }
    }
  }

  // Recalculate break time if times changed
  let updates: Record<string, any> = {
    reason: dto.reason,
    remarks: dto.remarks ?? "",
    last_status: "Edited",
    sync: "E",
    date_timestamp: new Date(),
    fk_user_id,
    authorize: false,
    a_timestamp: null,
    fk_a_user_id: null,
  };

  if (dto.leaving_time && dto.return_time) {
    const leavingTime = new Date(dto.leaving_time);
    const returnTime = new Date(dto.return_time);
    let breakDurationMs = returnTime.getTime() - leavingTime.getTime();
    if (breakDurationMs < 0) breakDurationMs += 24 * 60 * 60 * 1000;
    updates = {
      ...updates,
      leaving_time: dto.leaving_time,
      return_time: dto.return_time,
      break_time: Math.floor(breakDurationMs / 60000),
    };
  }

  const result = await db
    .update(salPersonalWork)
    .set(updates)
    .where(eq(sql<number>`CAST(${salPersonalWork.pk_pw_id} AS integer)`, id))
    .returning({ pk_pw_id: salPersonalWork.pk_pw_id });

  return result.length > 0;
}

export async function authorizePersonalWorkRequest(
  dto: AuthorizePersonalWorkDtoType,
  authorizedByUserId: number
): Promise<boolean> {
  const result = await db
    .update(salPersonalWork)
    .set({
      authorize: dto.authorize,
      a_timestamp: new Date(),
      fk_a_user_id: authorizedByUserId,
      remarks: dto.remarks ?? "",
      last_status: dto.authorize ? "Authorized" : "Rejected",
    })
    .where(eq(sql<number>`CAST(${salPersonalWork.pk_pw_id} AS integer)`, dto.pk_pw_id))
    .returning();

  return result.length > 0;
}

export async function deletePersonalWorkRequest(
  id: number
): Promise<boolean> {
  // Check if it's already authorized
  const req = await db
    .select({ authorize: salPersonalWork.authorize })
    .from(salPersonalWork)
    .where(eq(sql<number>`CAST(${salPersonalWork.pk_pw_id} AS integer)`, id))
    .limit(1);

  const firstReq = req[0];
  if (!firstReq) {
    return false;
  }

  if (firstReq.authorize) {
    throw new Error("Cannot delete an authorized request.");
  }

  const result = await db
    .delete(salPersonalWork)
    .where(eq(sql<number>`CAST(${salPersonalWork.pk_pw_id} AS integer)`, id))
    .returning();

  return result.length > 0;
}
