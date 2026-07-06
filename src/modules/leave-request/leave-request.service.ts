import { and, between, desc, eq, gte, ilike, isNull, lte, ne, or, sql } from 'drizzle-orm';

import type {
  CreateLeaveRequestDtoType,
  UpdateLeaveRequestDtoType,
  LeaveRequestFilterDtoType,
  AuthorizeLeaveRequestDtoType,
  DeleteLeaveRequestDtoType,
  EmployeeBalanceQueryDtoType,
  UpdateLeaveBalanceDtoType,
} from './leave-request.dto.js';
import {
  sal_leave_request,
  sal_lr_details,
  sal_employee,
  app_user,
  sal_annual_leave,
  sal_leave_encashment,
  sal_structure,
  sal_holidays,
  sal_sel_holidays,
  sal_attendance,
  sal_m_attendance,
  sal_m_atten_date,
  hr_notification,
  cont_department,
  cont_designation,
  temp_table,
} from '@/shared/database/schemas/index.js';
import type {
  LeaveRequestListRow,
  LeaveRequestWithDetails,
  EmployeeLeaveBalance,
  EmployeeOption,
  LeaveTypeOption,
  PaginatedResult,
} from './leave-request.types.js';

import { db } from '@/config/db.config.js';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function buildWhereConditions(filter: LeaveRequestFilterDtoType) {
  const conditions = [];

  // Request date range  (always required – defaults to current FY in controller)
  if (filter.from_req_date && filter.to_req_date) {
    conditions.push(
      between(sal_leave_request.request_date, filter.from_req_date, filter.to_req_date),
    );
  }

  // Employee name text filter
  if (filter.employee) {
    conditions.push(ilike(sal_employee.employee, `${filter.employee}%`));
  }

  // Request number
  if (filter.request_no) {
    conditions.push(ilike(sal_leave_request.request_no, `${filter.request_no}%`));
  }

  // Reason / remarks / last_status
  if (filter.reason) conditions.push(ilike(sal_leave_request.reason, `${filter.reason}%`));
  if (filter.remarks) conditions.push(ilike(sal_leave_request.remarks, `${filter.remarks}%`));
  if (filter.last_status)
    conditions.push(ilike(sal_leave_request.last_status, `${filter.last_status}%`));

  // From Date range
  if (filter.from_from_date && filter.to_from_date)
    conditions.push(
      between(sal_leave_request.from_date, filter.from_from_date, filter.to_from_date),
    );
  else if (filter.from_from_date)
    conditions.push(gte(sal_leave_request.from_date, filter.from_from_date));
  else if (filter.to_from_date)
    conditions.push(lte(sal_leave_request.from_date, filter.to_from_date));

  // To Date range
  if (filter.from_to_date && filter.to_to_date)
    conditions.push(between(sal_leave_request.to_date, filter.from_to_date, filter.to_to_date));
  else if (filter.from_to_date)
    conditions.push(gte(sal_leave_request.to_date, filter.from_to_date));
  else if (filter.to_to_date) conditions.push(lte(sal_leave_request.to_date, filter.to_to_date));

  // Numeric range helper
  const num_range = (col: any, from?: number, to?: number) => {
    if (from !== undefined && to !== undefined)
      conditions.push(between(col, String(from), String(to)));
    else if (from !== undefined) conditions.push(gte(col, String(from)));
    else if (to !== undefined) conditions.push(lte(col, String(to)));
  };

  num_range(sal_leave_request.bal_leave, filter.from_bal_leave, filter.to_bal_leave);
  num_range(sal_leave_request.bal_paid, filter.from_bal_paid, filter.to_bal_paid);
  num_range(sal_leave_request.bal_sick, filter.from_bal_sick, filter.to_bal_sick);
  num_range(
    sal_leave_request.bal_paid_casual,
    filter.from_bal_paid_casual,
    filter.to_bal_paid_casual,
  );
  num_range(
    sal_leave_request.bal_unpaid_casual,
    filter.from_bal_unpaid_casual,
    filter.to_bal_unpaid_casual,
  );
  num_range(sal_leave_request.absent, filter.from_absent, filter.to_absent);
  num_range(sal_leave_request.total_leave, filter.from_total_leave, filter.to_total_leave);
  num_range(sal_leave_request.paid_leave, filter.from_paid_leave, filter.to_paid_leave);
  num_range(sal_leave_request.rest_day, filter.from_rest_day, filter.to_rest_day);
  num_range(sal_leave_request.unpaid_leave, filter.from_unpaid_leave, filter.to_unpaid_leave);
  num_range(sal_leave_request.paid_holiday, filter.from_paid_holiday, filter.to_paid_holiday);
  num_range(sal_leave_request.sick_leave, filter.from_sick_leave, filter.to_sick_leave);
  num_range(sal_leave_request.paid_casual, filter.from_paid_casual, filter.to_paid_casual);
  num_range(sal_leave_request.unpaid_casual, filter.from_unpaid_casual, filter.to_unpaid_casual);
  num_range(sal_leave_request.maternity, filter.from_maternity, filter.to_maternity);

  // Employee filter
  if (filter.fk_emp_id) {
    conditions.push(eq(sal_leave_request.fk_emp_id, filter.fk_emp_id));
  }

  // Own-record filter
  if (filter.own_record && filter.fk_set_id) {
    conditions.push(eq(sal_leave_request.fk_user_id, Number(filter.fk_set_id)));
  }

  return conditions;
}

// ─────────────────────────────────────────────────────────────
// FETCH LIST
// ─────────────────────────────────────────────────────────────

export async function getLeaveRequests(
  filter: LeaveRequestFilterDtoType,
): Promise<PaginatedResult<LeaveRequestListRow>> {
  const conditions = buildWhereConditions(filter);
  const offset = (filter.page - 1) * filter.page_size;

  const [rows, count_result] = await Promise.all([
    db
      .select({
        pk_lr_id: sal_leave_request.pk_lr_id,
        request_no: sal_leave_request.request_no,
        request_date: sal_leave_request.request_date,
        from_date: sal_leave_request.from_date,
        to_date: sal_leave_request.to_date,
        fk_emp_id: sal_leave_request.fk_emp_id,
        fk_set_id: sal_employee.fk_set_id,
        employee: sal_employee.employee,
        bal_leave: sal_leave_request.bal_leave,
        bal_paid: sal_leave_request.bal_paid,
        bal_sick: sal_leave_request.bal_sick,
        bal_paid_casual: sal_leave_request.bal_paid_casual,
        bal_unpaid_casual: sal_leave_request.bal_unpaid_casual,
        rest_day: sal_leave_request.rest_day,
        unpaid_leave: sal_leave_request.unpaid_leave,
        paid_holiday: sal_leave_request.paid_holiday,
        sick_leave: sal_leave_request.sick_leave,
        paid_casual: sal_leave_request.paid_casual,
        unpaid_casual: sal_leave_request.unpaid_casual,
        maternity: sal_leave_request.maternity,
        paid_leave: sal_leave_request.paid_leave,
        total_leave: sal_leave_request.total_leave,
        absent: sal_leave_request.absent,
        reason: sal_leave_request.reason,
        remarks: sal_leave_request.remarks,
        date_timestamp: sal_leave_request.date_timestamp,
        last_status: sal_leave_request.last_status,
        authorize: sal_leave_request.authorize,
        a_timestamp: sal_leave_request.a_timestamp,
        accepted: sal_leave_request.accepted,
        a_remarks: sal_leave_request.a_remarks,
        user_name: app_user.username,
        a_user: sql<string>`(
          SELECT u.username FROM app_user u
          WHERE u.pk_user_id = ${sal_leave_request.fk_a_user_id}
          LIMIT 1
        )`,
      })
      .from(sal_leave_request)
      .innerJoin(
        sal_employee,
        eq(sal_employee.pk_emp_id, sal_leave_request.fk_emp_id),
      )
      .leftJoin(app_user, eq(app_user.pk_user_id, sal_leave_request.fk_user_id))
      .where(and(...conditions))
      .orderBy(sal_leave_request.request_no)
      .limit(filter.page_size)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(sal_leave_request)
      .innerJoin(
        sal_employee,
        eq(sal_employee.pk_emp_id, sal_leave_request.fk_emp_id),
      )
      .where(and(...conditions)),
  ]);

  const total = count_result[0]?.count ?? 0;

  return {
    data: rows as LeaveRequestListRow[],
    meta: {
      page: filter.page,
      page_size: filter.page_size,
      total,
      total_pages: Math.ceil(total / filter.page_size),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// GET SINGLE
// ─────────────────────────────────────────────────────────────

export async function getLeaveRequestById(
  pk_lr_id: number,
): Promise<LeaveRequestWithDetails | null> {
  const [header] = await db
    .select()
    .from(sal_leave_request)
    .where(eq(sal_leave_request.pk_lr_id, pk_lr_id))
    .limit(1);

  if (!header) return null;

  const details = await db
    .select()
    .from(sal_lr_details)
    .where(eq(sal_lr_details.fk_lr_id, pk_lr_id))
    .orderBy(sal_lr_details.lr_date);

  const [emp] = await db
    .select({ employee: sal_employee.employee })
    .from(sal_employee)
    .where(eq(sal_employee.pk_emp_id, header.fk_emp_id!))
    .limit(1);

  return {
    ...header,
    details,
    employee_name: emp?.employee ?? null,
    created_by_name: null,
    authorized_by_name: null,
  };
}

// ─────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────

export async function createLeaveRequest(
  dto: CreateLeaveRequestDtoType,
  fk_user_id: number,
): Promise<number> {
  return await db.transaction(async (tx) => {
    // Check duplicate request_no
    const [existing] = await tx
      .select({ pk_lr_id: sal_leave_request.pk_lr_id })
      .from(sal_leave_request)
      .where(eq(sal_leave_request.request_no, dto.request_no))
      .limit(1);

    if (existing) {
      throw new Error(`Request No. ${dto.request_no} already exists.`);
    }

    const [inserted] = await tx.insert(sal_leave_request).values({
      request_no: dto.request_no,
      request_date: dto.request_date,
      from_date: dto.from_date,
      to_date: dto.to_date,
      fk_emp_id: dto.fk_emp_id,
      bal_leave: dto.bal_leave,
      bal_paid: dto.bal_paid,
      bal_sick: dto.bal_sick,
      bal_paid_casual: dto.bal_paid_casual,
      bal_unpaid_casual: dto.bal_unpaid_casual,
      rest_day: dto.rest_day,
      unpaid_leave: dto.unpaid_leave,
      paid_holiday: dto.paid_holiday,
      sick_leave: dto.sick_leave,
      paid_casual: dto.paid_casual,
      unpaid_casual: dto.unpaid_casual,
      maternity: dto.maternity,
      paid_leave: dto.paid_leave,
      total_leave: dto.total_leave,
      absent: dto.absent,
      reason: dto.reason,
      remarks: dto.remarks,
      attachment_path: dto.attachment_path,
      date_timestamp: new Date(),
      fk_user_id,
      last_status: 'Added',
      authorize: false,
      a_timestamp: null,
      fk_a_user_id: null,
      accepted: '',
      a_remarks: '',
    }).returning({ pk_lr_id: sal_leave_request.pk_lr_id });

    if (!inserted) {
      throw new Error('Failed to create leave request');
    }
    const pk_lr_id = inserted.pk_lr_id;

    // Insert detail lines
    if (dto.details.length > 0) {
      const detail_inserts = dto.details.map((d: any, _i: number) => ({
        fk_lr_id: pk_lr_id,
        lr_date: d.lr_date,
        lr_day: d.lr_day ?? null,
        type: d.type ?? null,
        typ_id: String(d.typ_id),
      }));
      await tx.insert(sal_lr_details).values(detail_inserts as any);
    }

    // HR Notification
    await _insert_notification(tx, {
      form_name: 'Leave Request',
      n_id: pk_lr_id,
      edit_mode: 0,
      fk_user_id,
      authorize: false,
      announcement: _build_announcement(dto),
      fk_set_id: '',
    });

    return pk_lr_id;
  });
}

// ─────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────

export async function updateLeaveRequest(
  dto: UpdateLeaveRequestDtoType,
  fk_user_id: number,
): Promise<void> {
  await db.transaction(async (tx) => {
    const pk_lr_id = dto.pk_lr_id;

    // Duplicate check
    if (dto.request_no) {
      const [dup] = await tx
         .select({ pk_lr_id: sal_leave_request.pk_lr_id })
         .from(sal_leave_request)
         .where(
           and(
             eq(sal_leave_request.request_no, dto.request_no),
             ne(sal_leave_request.pk_lr_id, pk_lr_id),
           ),
         )
         .limit(1);
      if (dup) throw new Error(`Request No. ${dto.request_no} already exists.`);
    }

    // Patch header
    const { details: detail_lines, pk_lr_id: _id, ...header_fields } = dto as any;
    await tx
      .update(sal_leave_request)
      .set({
        ...header_fields,
        fk_emp_id: dto.fk_emp_id ? dto.fk_emp_id : undefined,
        last_status: 'Edited',
        sync: 'E',
        date_timestamp: new Date(),
        fk_user_id,
        authorize: false,
        a_timestamp: null,
        fk_a_user_id: null,
        accepted: '',
        a_remarks: '',
      })
      .where(eq(sal_leave_request.pk_lr_id, pk_lr_id));

    // Reconcile detail lines
    if (detail_lines && detail_lines.length > 0) {
      const keep_ids = (detail_lines as any[])
        .filter((d: any) => d.pk_lrd_id)
        .map((d: any) => d.pk_lrd_id);

      // Delete lines not in the updated set
      if (keep_ids.length > 0) {
        await tx.execute(
          sql`DELETE FROM sal_lr_details
              WHERE fk_lr_id = ${pk_lr_id}
              AND pk_lrd_id NOT IN (${sql.join(
            keep_ids.map((id: number) => sql`${id}`),
            sql`, `,
          )})`,
        );
      } else {
        await tx.delete(sal_lr_details).where(eq(sal_lr_details.fk_lr_id, pk_lr_id));
      }

      // Upsert detail rows
      for (const d of detail_lines as any[]) {
        if (d.pk_lrd_id) {
          await tx
            .update(sal_lr_details)
            .set({ lr_date: d.lr_date, lr_day: d.lr_day, type: d.type, typ_id: String(d.typ_id) })
            .where(eq(sal_lr_details.pk_lrd_id, d.pk_lrd_id));
        } else {
          await tx.insert(sal_lr_details).values({
            fk_lr_id: pk_lr_id,
            lr_date: d.lr_date,
            lr_day: d.lr_day ?? null,
            type: d.type ?? null,
            typ_id: String(d.typ_id),
          } as any);
        }
      }
    }

    // HR Notification – remove old then re-insert
    await tx
      .delete(hr_notification)
      .where(
        and(eq(hr_notification.form_name, 'Leave Request'), eq(hr_notification.n_id, pk_lr_id)),
      );

    await _insert_notification(tx, {
      form_name: 'Leave Request',
      n_id: pk_lr_id,
      edit_mode: 1,
      fk_user_id,
      authorize: false,
      announcement: dto.request_no ?? '',
      fk_set_id: '',
    });
  });
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────

export async function deleteLeaveRequest(dto: DeleteLeaveRequestDtoType): Promise<void> {
  await db.transaction(async (tx) => {
    const pk_lr_id = dto.pk_lr_id;

    // Details cascade, but explicit delete for safety
    await tx.delete(sal_lr_details).where(eq(sal_lr_details.fk_lr_id, pk_lr_id));

    await tx.delete(sal_leave_request).where(eq(sal_leave_request.pk_lr_id, pk_lr_id));

    // Remove old notification then log deletion
    await tx
      .delete(hr_notification)
      .where(
        and(eq(hr_notification.form_name, 'Leave Request'), eq(hr_notification.n_id, pk_lr_id)),
      );

    await _insert_notification(tx, {
      form_name: 'Leave Request',
      n_id: pk_lr_id,
      edit_mode: 2,
      fk_user_id: dto.fk_user_id,
      fk_set_id: dto.fk_set_id ?? '',
      authorize: false,
      announcement: `Deleted by ${dto.fk_user_id}`,
    });
  });
}

// ─────────────────────────────────────────────────────────────
// AUTHORIZE
// ─────────────────────────────────────────────────────────────

export async function authorizeLeaveRequest(dto: AuthorizeLeaveRequestDtoType): Promise<void> {
  await db
    .update(sal_leave_request)
    .set({
      authorize: true,
      a_timestamp: new Date(),
      fk_a_user_id: dto.fk_a_user_id,
      accepted: dto.accepted,
      a_remarks: dto.a_remarks,
      last_status: 'Authorized',
    })
    .where(eq(sal_leave_request.pk_lr_id, dto.pk_lr_id));
}

// ─────────────────────────────────────────────────────────────
// EMPLOYEE LEAVE BALANCE CALCULATOR
// Mirrors FillAnnualLeave / FillSickLeave / FillPaidCasualLeave
// ─────────────────────────────────────────────────────────────

export async function getEmployeeLeaveBalance(
  query: EmployeeBalanceQueryDtoType,
): Promise<EmployeeLeaveBalance> {
  const { fk_emp_id, from_date, to_date, request_year, pk_lr_id } = query;
  const year = request_year ?? new Date(from_date).getFullYear();

  // ── Annual Leave ──────────────────────────────────────────
  const [annual_leave_row] = await db
    .select({ tot_al: sal_annual_leave.tot_al })
    .from(sal_annual_leave)
    .where(
      and(eq(sal_annual_leave.fk_emp_id, String(fk_emp_id)), eq(sal_annual_leave.cal_year, year)),
    )
    .limit(1);

  const [encash_row] = await db
    .select({ total_e_day: sql<number>`COALESCE(SUM(e_day::numeric), 0)` })
    .from(sal_leave_encashment)
    .where(
      and(
        eq(sal_leave_encashment.fk_emp_id, String(fk_emp_id)),
        eq(sal_leave_encashment.le_year, year),
        pk_lr_id ? sql`${sal_leave_encashment.pk_sle_id} <> ${pk_lr_id}` : sql`1=1`,
      ),
    );

  const [att_annual_row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sal_attendance)
    .innerJoin(sal_structure, sql`${sal_attendance.fk_ss_id}::numeric = ${sal_structure.pk_ss_id}`)
    .where(
      and(
        eq(sal_structure.fk_emp_id, String(fk_emp_id)),
        eq(sal_attendance.authorize, true),
        eq(sal_attendance.w_type, '508'),
        sql`EXTRACT(year FROM ${sal_attendance.at_date}) = ${year}`,
      ),
    );

  const tot_al = annual_leave_row?.tot_al ?? 0;
  const used = Number(encash_row?.total_e_day ?? 0) + Number(att_annual_row?.count ?? 0);
  const bal_annual_leave = Math.max(0, tot_al - used);

  // ── Paid Holiday ──────────────────────────────────────────
  const [paid_hol_row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sal_structure)
    .innerJoin(
      sal_sel_holidays,
      sql`${sal_sel_holidays.fk_ss_id}::numeric = ${sal_structure.pk_ss_id}`,
    )
    .innerJoin(sal_holidays, eq(sal_sel_holidays.fk_sh_id, sal_holidays.pk_sh_id))
    .where(
      and(
        eq(sal_structure.fk_emp_id, String(fk_emp_id)),
        between(sal_holidays.holiday_date, from_date, to_date),
      ),
    );

  const bal_paid_holiday = Number(paid_hol_row?.count ?? 0);

  // ── Sick Leave ────────────────────────────────────────────
  const [str_row] = await db
    .select({
      sal_start: sal_structure.sal_start,
      revise: sal_structure.revise,
      sl: sal_structure.sl,
      cl: sal_structure.cl,
      ucl: sal_structure.ucl,
    })
    .from(sal_structure)
    .where(
      and(eq(sal_structure.fk_emp_id, String(fk_emp_id)), lte(sal_structure.sal_start, from_date)),
    )
    .orderBy(desc(sal_structure.sal_start))
    .limit(1);

  let bal_sick_leave = 0;
  let sl_entitlement = 0;
  if (str_row?.sal_start && str_row?.revise) {
    sl_entitlement = Number(str_row.sl ?? 0);
    const [sick_used_row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sal_attendance)
      .innerJoin(
        sal_structure,
        sql`${sal_attendance.fk_ss_id}::numeric = ${sal_structure.pk_ss_id}`,
      )
      .where(
        and(
          eq(sal_structure.fk_emp_id, String(fk_emp_id)),
          eq(sal_attendance.authorize, true),
          eq(sal_attendance.w_type, '507'),
          between(sal_attendance.at_date, str_row.sal_start, str_row.revise),
        ),
      );
    bal_sick_leave = Math.max(0, sl_entitlement - Number(sick_used_row?.count ?? 0));
  }

  // ── Paid Casual Leave ─────────────────────────────────────
  let bal_paid_casual = 0;
  let cl_entitlement = 0;
  if (str_row?.sal_start && str_row?.revise) {
    cl_entitlement = Number(str_row.cl ?? 0);
    const [pcl_used_row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sal_attendance)
      .innerJoin(
        sal_structure,
        sql`${sal_attendance.fk_ss_id}::numeric = ${sal_structure.pk_ss_id}`,
      )
      .where(
        and(
          eq(sal_structure.fk_emp_id, String(fk_emp_id)),
          eq(sal_attendance.authorize, true),
          eq(sal_attendance.w_type, '509'),
          between(sal_attendance.at_date, str_row.sal_start, str_row.revise),
        ),
      );
    bal_paid_casual = Math.max(
      0,
      cl_entitlement - Number(pcl_used_row?.count ?? 0),
    );
  }

  // ── Unpaid Casual Leave ───────────────────────────────────
  let bal_unpaid_casual = 0;
  let ucl_entitlement = 0;
  if (str_row?.sal_start && str_row?.revise) {
    ucl_entitlement = Number((str_row as any).ucl ?? 0);
    const [ucl_used_row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sal_attendance)
      .innerJoin(
        sal_structure,
        sql`${sal_attendance.fk_ss_id}::numeric = ${sal_structure.pk_ss_id}`,
      )
      .where(
        and(
          eq(sal_structure.fk_emp_id, String(fk_emp_id)),
          eq(sal_attendance.authorize, true),
          eq(sal_attendance.w_type, '510'),
          between(sal_attendance.at_date, str_row.sal_start, str_row.revise),
        ),
      );
    bal_unpaid_casual = Math.max(
      0,
      ucl_entitlement - Number(ucl_used_row?.count ?? 0),
    );
  }

  // ── Paid Leave ────────────────────────────────────────────
  const tot_paid_leave = 12;
  const [paid_used_row] = await db
    .select({ total: sql<number>`COALESCE(SUM(paid_leave::numeric), 0)` })
    .from(sal_leave_request)
    .where(
      and(
        eq(sal_leave_request.fk_emp_id, Number(fk_emp_id)),
        eq(sal_leave_request.last_status, 'Approved'),
      )
    );
  const bal_paid_leave = Math.max(0, tot_paid_leave - Number(paid_used_row?.total ?? 0));

  const [emp_row] = await db
    .select({ employee: sal_employee.employee })
    .from(sal_employee)
    .where(sql`${sal_employee.pk_emp_id}::text = ${String(fk_emp_id)}`)
    .limit(1);

  // If no structure record exists, return default values to show leave types
  if (!str_row) {
    return {
      fk_emp_id: String(fk_emp_id),
      employee_name: emp_row?.employee ?? "",
      bal_annual_leave: 0,
      bal_paid_holiday: 0,
      bal_sick_leave: 0,
      bal_paid_casual: 0,
      bal_unpaid_casual: 0,
      tot_annual_leave: 0,
      tot_paid_holiday: 0,
      tot_sick_leave: 0,
      tot_paid_casual: 0,
      tot_unpaid_casual: 0,
      bal_paid_leave: 0,
      tot_paid_leave: 0,
    };
  }

  return {
    fk_emp_id: String(fk_emp_id),
    employee_name: emp_row?.employee ?? '',
    bal_annual_leave,
    bal_paid_holiday,
    bal_sick_leave,
    bal_paid_casual,
    bal_unpaid_casual,
    tot_annual_leave: tot_al,
    tot_paid_holiday: bal_paid_holiday, // no separate entitlement; count is the total available
    tot_sick_leave: sl_entitlement,
    tot_paid_casual: cl_entitlement,
    tot_unpaid_casual: ucl_entitlement,
    bal_paid_leave,
    tot_paid_leave,
  };
}

// ─────────────────────────────────────────────────────────────
// EMPLOYEE DROPDOWN
// ─────────────────────────────────────────────────────────────

export async function getEmployeeOptions(): Promise<EmployeeOption[]> {
  const rows = await db
    .select({
      pk_emp_id: sal_employee.pk_emp_id,
      emp_code: sal_employee.emp_code,
      contact_name: sal_employee.employee,
      department: cont_department.department,
      designation: cont_designation.designation,
      fk_set_id: sal_employee.fk_set_id,
      doj: sal_employee.doj,
    })
    .from(sal_employee)
    .leftJoin(cont_department, eq(cont_department.pk_dep_id, sal_employee.fk_dep_id))
    .leftJoin(cont_designation, eq(cont_designation.pk_des_id, sal_employee.fk_deg_id))
    .orderBy(sal_employee.employee);

  return rows.map((r) => ({
    ...r,
    pk_emp_id: String(r.pk_emp_id),
    doj: r.doj ? r.doj.toISOString().split('T')[0] : '',
  })) as EmployeeOption[];
}

// ─────────────────────────────────────────────────────────────
// LEAVE TYPE DROPDOWN  (temp_table)
// ─────────────────────────────────────────────────────────────

export async function getLeaveTypes(): Promise<LeaveTypeOption[]> {
  const leave_type_ids = [
    '502',
    '504',
    '505',
    '506',
    '507',
    '508',
    '509',
    '510',
    '512',
    '513',
    '514',
    '515',
    '516',
  ];

  const rows = await db
    .select({ id: temp_table.id, temp_fields: temp_table.temp_fields })
    .from(temp_table)
    .where(
      sql`${temp_table.id}::text = ANY(ARRAY[${sql.join(
        leave_type_ids.map((id: string) => sql`${id}`),
        sql`, `,
      )}])`,
    );

  const result = rows.map((r: { id: unknown; temp_fields: string | null }) => ({
    id: String(r.id),
    label: r.temp_fields ?? '',
  }));

  // Fallback to default leave types if temp_table is empty
  if (result.length === 0) {
    return [
      { id: '502', label: 'Annual Leave' },
      { id: '504', label: 'Paid Holiday' },
      { id: '505', label: 'Sick Leave' },
      { id: '506', label: 'Paid Casual Leave' },
      { id: '507', label: 'Unpaid Casual Leave' },
      { id: '508', label: 'Unpaid Leave' },
      { id: '509', label: 'Absent' },
      { id: '510', label: 'Rest Day' },
      { id: '512', label: 'Maternity Leave' },
      { id: '513', label: 'Paternity Leave' },
      { id: '514', label: 'Compensatory Off' },
      { id: '515', label: 'Special Leave' },
      { id: '516', label: 'Leave Without Pay' },
    ];
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────

async function _insert_notification(
  tx: any,
  payload: {
    form_name: string;
    n_id: number;
    edit_mode: number;
    fk_user_id: number;
    fk_set_id?: string;
    authorize: boolean;
    announcement: string;
  },
) {
  await tx.insert(hr_notification).values({
    not_date: new Date(),
    form_name: payload.form_name,
    announcement: payload.announcement,
    file_name: '',
    n_id: payload.n_id,
    edit_mode: payload.edit_mode,
    fk_user_id: payload.fk_user_id,
    fk_set_id: payload.fk_set_id ?? null,
    authorize: payload.authorize,
  });
}

function _build_announcement(dto: CreateLeaveRequestDtoType): string {
  return (
    `Request No.: ${dto.request_no}; ` +
    `Request Date: ${dto.request_date}; ` +
    `Leave From: ${dto.from_date} To ${dto.to_date}; ` +
    `Total Leave Applied: ${dto.total_leave}; ` +
    `Reasons: ${dto.reason}`
  );
}

// ─────────────────────────────────────────────────────────────
// UPDATE LEAVE BALANCE FOR ALL EMPLOYEES
// ─────────────────────────────────────────────────────────────

export async function updateLeaveBalanceForAllEmployees(
  dto: UpdateLeaveBalanceDtoType,
): Promise<{ inserted: number; updated: number; total: number }> {
  const { year } = dto;
  
  // Get all employees
  const employees = await db.select({
    pk_emp_id: sal_employee.pk_emp_id,
  }).from(sal_employee);
  
  let inserted = 0;
  let updated = 0;
  
  for (const employee of employees) {
    // Check if employee already has a record for the specified year
    const existingRecords = await db.select()
      .from(sal_annual_leave)
      .where(eq(sal_annual_leave.fk_emp_id, String(employee.pk_emp_id)));

    const yearRecord = existingRecords.find(r => r.cal_year === year);

    if (!yearRecord) {
      // Insert new record with values from database (no static defaults)
      // Get previous year balance if exists
      const prevYearRecord = existingRecords.find(r => r.cal_year === year - 1);
      const py_bal = prevYearRecord?.tot_al ?? 0;

      // pk_sal_id is now an integer - use auto-increment or sequence
      await db.insert(sal_annual_leave).values({
        fk_emp_id: String(employee.pk_emp_id),
        cal_year: year,
        al_roff: 0,
        py_bal: py_bal,
        tot_al: 0, // No static default - will be updated when data is available
      });
      inserted++;
    }
    // Don't update existing records - let them remain as they are in the database
  }
  
  return {
    inserted,
    updated,
    total: employees.length,
  };
}

export async function cancelLeaveRequest(pk_lr_id: number, fk_user_id: number): Promise<{ success: boolean; message: string }> {
  return await db.transaction(async (tx) => {
    // 1. Fetch the leave request
    const [lr] = await tx
      .select()
      .from(sal_leave_request)
      .where(eq(sal_leave_request.pk_lr_id, pk_lr_id))
      .limit(1);

    if (!lr) {
      throw new Error('Leave request not found');
    }

    // 2. Check current status
    // Pending status: authorized is false, and it isn't already cancelled or cancellation pending
    const isPending = !lr.authorize && lr.last_status !== 'Cancelled' && lr.last_status !== 'Cancellation Pending';
    const isApproved = lr.authorize && lr.accepted === 'Accept';

    if (isPending) {
      await tx
        .update(sal_leave_request)
        .set({
          last_status: 'Cancelled',
          date_timestamp: new Date(),
          fk_user_id,
        })
        .where(eq(sal_leave_request.pk_lr_id, pk_lr_id));

      await _insert_notification(tx, {
        form_name: 'Leave Request',
        n_id: pk_lr_id,
        edit_mode: 3, // Cancellation mode
        fk_user_id,
        fk_set_id: '',
        authorize: false,
        announcement: `Leave request ${lr.request_no} cancelled by employee`,
      });

      return { success: true, message: 'Leave request cancelled successfully.' };
    } else if (isApproved) {
      await tx
        .update(sal_leave_request)
        .set({
          last_status: 'Cancellation Pending',
          date_timestamp: new Date(),
          fk_user_id,
        })
        .where(eq(sal_leave_request.pk_lr_id, pk_lr_id));

      await _insert_notification(tx, {
        form_name: 'Leave Request',
        n_id: pk_lr_id,
        edit_mode: 3,
        fk_user_id,
        fk_set_id: '',
        authorize: false,
        announcement: `Cancellation request for approved leave ${lr.request_no} submitted by employee`,
      });

      return { success: true, message: 'Cancellation request sent to manager for approval.' };
    } else {
      throw new Error('Only Pending or Approved leave requests can be cancelled.');
    }
  });
}
