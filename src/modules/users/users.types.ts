// ─────────────────────────────────────────────
//  users.types.ts
//  Mirrors AppUser table + related lookup tables
// ─────────────────────────────────────────────

export interface AppUser {
  pk_user_id: number;
  fk_emp_id: number | null;
  fk_ec_id: number | null; // EmailConfiguration FK
  fk_user_id: number | null; // created-by user
  username: string;
  password?: string | null;
  mobile: string | null;
  answer?: string | null;
  last_status?: string | null;
  date_time_stamp: Date;
  own_records?: boolean | null;
  other_records?: boolean | null;
}

// ── List-view row (JOIN result returned to the grid) ──
export interface UserListRow {
  pk_user_id: number;
  fk_emp_id: number | null;
  employee: string | null;
  username: string;
  password?: string | null;
  mobile: string | null;
  fk_ec_id: number | null;
  date_time_stamp: Date;
  fk_user_id: number;
  last_status?: string | null;
  answer?: string | null;
  creator: string;
}

// ── Lookup: sal_employee ──
export interface Employee {
  pk_emp_id: number;
  emp_code: string;
  type: string;
  employee: string; // ContactName
  doj: Date | null;
}

// ── Lookup: email_configurations ──
export interface EmailConfiguration {
  pk_ec_id: number;
  from_email: string;
}

// ── Lookup: app_questions ──
export interface SecurityQuestion {
  pk_question_id: number;
  questions: string;
}

// ── Filter params for GET /users ──
export interface UserFilterParams {
  username?: string;
  employee?: string;
  creator?: string;
  last_status?: string;
  date_time_stamp?: string;
}

// ── Pagination ──
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
