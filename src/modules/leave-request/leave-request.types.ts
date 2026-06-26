import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import {
  sal_leave_request,
  sal_lr_details,
  sal_employee,
  app_user,
  app_user_right,
  sal_annual_leave,
  sal_leave_encashment,
  sal_structure,
  sal_holidays,
  sal_sel_holidays,
  sal_attendance,
  sal_m_attendance,
  sal_m_atten_date,
  hr_notification,
  temp_table,
  cont_department,
  cont_designation,
} from '@/shared/database/schemas/index.js';

// ─────────────────────────────────────────────────────────────
// SELECT TYPES  (what you read from the DB)
// ─────────────────────────────────────────────────────────────
export type SalLeaveRequest = InferSelectModel<typeof sal_leave_request>;
export type SalLrDetail = InferSelectModel<typeof sal_lr_details>;
export type SalEmployee = InferSelectModel<typeof sal_employee>;
export type AppUser = InferSelectModel<typeof app_user>;
export type AppUserRight = InferSelectModel<typeof app_user_right>;
export type SalAnnualLeave = InferSelectModel<typeof sal_annual_leave>;
export type SalLeaveEncashment = InferSelectModel<typeof sal_leave_encashment>;
export type SalStructure = InferSelectModel<typeof sal_structure>;
export type SalHoliday = InferSelectModel<typeof sal_holidays>;
export type SalSelHoliday = InferSelectModel<typeof sal_sel_holidays>;
export type SalAttendance = InferSelectModel<typeof sal_attendance>;
export type SalMAttendance = InferSelectModel<typeof sal_m_attendance>;
export type SalMAttenDate = InferSelectModel<typeof sal_m_atten_date>;
export type HrNotification = InferSelectModel<typeof hr_notification>;
export type TempTable = InferSelectModel<typeof temp_table>;
export type ContDepartment = InferSelectModel<typeof cont_department>;
export type ContDesignation = InferSelectModel<typeof cont_designation>;

// ─────────────────────────────────────────────────────────────
// INSERT TYPES  (what you write to the DB)
// ─────────────────────────────────────────────────────────────
export type NewSalLeaveRequest = InferInsertModel<typeof sal_leave_request>;
export type NewSalLrDetail = InferInsertModel<typeof sal_lr_details>;
export type NewSalEmployee = InferInsertModel<typeof sal_employee>;
export type NewAppUser = InferInsertModel<typeof app_user>;
export type NewHrNotification = InferInsertModel<typeof hr_notification>;

// ─────────────────────────────────────────────────────────────
// ENRICHED / JOINED TYPES
// ─────────────────────────────────────────────────────────────

/** Full leave request with its nested detail rows */
export interface LeaveRequestWithDetails extends SalLeaveRequest {
  details: SalLrDetail[];
  employee_name: string | null;
  created_by_name: string | null;
  authorized_by_name: string | null;
}

/** Row shown in the list grid */
export interface LeaveRequestListRow {
  pk_lr_id: number;
  request_no: string;
  request_date: string;
  from_date: string;
  to_date: string;
  employee: string;
  fk_emp_id: number;
  fk_set_id: string | null;
  total_leave: string;
  paid_leave: string;
  absent: string;
  bal_leave: string;
  bal_paid: string;
  bal_sick: string;
  bal_paid_casual: string;
  bal_unpaid_casual: string;
  rest_day: string;
  unpaid_leave: string;
  paid_holiday: string;
  sick_leave: string;
  paid_casual: string;
  unpaid_casual: string;
  maternity: string;
  reason: string | null;
  remarks: string | null;
  date_timestamp: Date | null;
  user_name: string | null;
  last_status: string | null;
  authorize: boolean | null;
  a_timestamp: Date | null;
  a_user: string | null;
  accepted: string | null;
  a_remarks: string | null;
}

/** Balance summary for a given employee */
export interface EmployeeLeaveBalance {
  fk_emp_id: string;
  employee_name: string;
  bal_annual_leave: number;
  bal_paid_holiday: number;
  bal_sick_leave: number;
  bal_paid_casual: number;
  bal_unpaid_casual: number;
  tot_annual_leave: number;
  tot_paid_holiday: number;
  tot_sick_leave: number;
  tot_paid_casual: number;
  tot_unpaid_casual: number;
}

/** Leave type dropdown option */
export interface LeaveTypeOption {
  id: string;
  label: string;
}

/** Employee dropdown option */
export interface EmployeeOption {
  pk_emp_id: string;
  emp_code: string;
  contact_name: string;
  department: string | null;
  designation: string | null;
  fk_set_id: string | null;
  doj: string | null;
}

/** Authorization payload coming from frmLRAuthorization */
export interface AuthorizePayload {
  pk_lr_id: number;
  accepted: 'Accept' | 'Reject';
  a_remarks: string;
  fk_a_user_id: number;
}

/** Pagination meta */
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Sync status codes */
export type SyncStatus = 'N' | 'C' | 'E';

/** Last status labels */
export type LastStatus = 'Added' | 'Edited' | 'Deleted';

/** Edit mode codes for hr_notification */
export type EditModeCode = 0 | 1 | 2; // 0=Added, 1=Edited, 2=Deleted
