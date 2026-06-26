import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { salPersonalWork } from "../../shared/database/schemas/sal-personal-work.schema.js";

export type SalPersonalWork = InferSelectModel<typeof salPersonalWork>;
export type NewSalPersonalWork = InferInsertModel<typeof salPersonalWork>;

export interface PersonalWorkListRow {
  pk_pw_id: number;
  request_date: Date;
  fk_emp_id: number;
  leaving_time: Date;
  return_time: Date;
  break_time: number;
  reason: string;
  remarks: string;
  date_timestamp: Date;
  fk_user_id: number;
  last_status: string;
  authorize: boolean;
  a_timestamp: Date | null;
  fk_a_user_id: number | null;
  employee_name: string | null;
  emp_code: string | null;
  user_name: string | null;
  authorized_by_name: string | null;
}

export interface PaginationMeta {
  page:       number;
  page_size:  number;
  total:      number;
  total_pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
