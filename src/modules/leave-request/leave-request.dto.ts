import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────

const numericId = z.coerce.number().int().positive();

const leaveDay = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a numeric value')
  .or(z.number().min(0).transform(String))
  .optional()
  .default('0');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');

// ─────────────────────────────────────────────────────────────
// LIST / FILTER  (GET /leave-requests)
// ─────────────────────────────────────────────────────────────

export const LeaveRequestFilterDto = z.object({
  // Date range filters
  from_req_date: isoDate.optional(),
  to_req_date: isoDate.optional(),
  from_from_date: isoDate.optional(),
  to_from_date: isoDate.optional(),
  from_to_date: isoDate.optional(),
  to_to_date: isoDate.optional(),
  from_timestamp: z.string().optional(),
  to_timestamp: z.string().optional(),
  from_a_timestamp: z.string().optional(),
  to_a_timestamp: z.string().optional(),

  // Text filters
  request_no: z.string().optional(),
  employee: z.string().optional(),
  reason: z.string().optional(),
  remarks: z.string().optional(),
  user_name: z.string().optional(),
  a_user: z.string().optional(),
  last_status: z.string().optional(),

  // Numeric range filters
  from_bal_leave: z.coerce.number().optional(),
  to_bal_leave: z.coerce.number().optional(),
  from_absent: z.coerce.number().optional(),
  to_absent: z.coerce.number().optional(),
  from_total_leave: z.coerce.number().optional(),
  to_total_leave: z.coerce.number().optional(),
  from_paid_leave: z.coerce.number().optional(),
  to_paid_leave: z.coerce.number().optional(),
  from_bal_paid: z.coerce.number().optional(),
  to_bal_paid: z.coerce.number().optional(),
  from_bal_sick: z.coerce.number().optional(),
  to_bal_sick: z.coerce.number().optional(),
  from_bal_paid_casual: z.coerce.number().optional(),
  to_bal_paid_casual: z.coerce.number().optional(),
  from_bal_unpaid_casual: z.coerce.number().optional(),
  to_bal_unpaid_casual: z.coerce.number().optional(),
  from_rest_day: z.coerce.number().optional(),
  to_rest_day: z.coerce.number().optional(),
  from_unpaid_leave: z.coerce.number().optional(),
  to_unpaid_leave: z.coerce.number().optional(),
  from_paid_holiday: z.coerce.number().optional(),
  to_paid_holiday: z.coerce.number().optional(),
  from_sick_leave: z.coerce.number().optional(),
  to_sick_leave: z.coerce.number().optional(),
  from_paid_casual: z.coerce.number().optional(),
  to_paid_casual: z.coerce.number().optional(),
  from_unpaid_casual: z.coerce.number().optional(),
  to_unpaid_casual: z.coerce.number().optional(),
  from_maternity: z.coerce.number().optional(),
  to_maternity: z.coerce.number().optional(),

  // Access control
  own_record: z.coerce.boolean().optional(),
  fk_emp_id: numericId.optional(),
  fk_set_id: z.string().optional(),

  // Pagination
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(500).default(50),
});
export type LeaveRequestFilterDtoType = z.infer<typeof LeaveRequestFilterDto>;

// ─────────────────────────────────────────────────────────────
// CREATE  (POST /leave-requests)
// ─────────────────────────────────────────────────────────────

export const LeaveDetailLineDto = z.object({
  pk_lrd_id: z.coerce.number().int().positive().optional(), // omit on new
  lr_date: isoDate,
  lr_day: z.string().max(20).optional(),
  type: z.string().max(30).optional(),
  typ_id: numericId,
});
export type LeaveDetailLineDtoType = z.infer<typeof LeaveDetailLineDto>;

// Base schema (without refinements so .partial() works in Zod v4)
const LeaveRequestBaseDto = z.object({
  request_no: z.string().min(1).max(20),
  request_date: isoDate,
  from_date: isoDate,
  to_date: isoDate,
  fk_emp_id: numericId,

  // Leave balances (captured at time of request)
  bal_leave: leaveDay,
  bal_paid: leaveDay,
  bal_sick: leaveDay,
  bal_paid_casual: leaveDay,
  bal_unpaid_casual: leaveDay,

  // Applied leave breakdown
  rest_day: leaveDay,
  unpaid_leave: leaveDay,
  paid_holiday: leaveDay,
  sick_leave: leaveDay,
  paid_casual: leaveDay,
  unpaid_casual: leaveDay,
  maternity: leaveDay,
  paid_leave: leaveDay,
  total_leave: leaveDay,
  absent: leaveDay,

  reason: z.string().max(100).min(1, 'Reason is required'),
  remarks: z.string().max(100).optional().default(''),
  attachment_path: z.string().max(500).optional(),

  details: z.array(LeaveDetailLineDto).min(1, 'At least one leave day is required'),
});

export const CreateLeaveRequestDto = LeaveRequestBaseDto.refine(
  (d) => new Date(d.from_date) <= new Date(d.to_date),
  { message: 'From Date must be before or equal to To Date', path: ['from_date'] },
).refine((d) => new Date(d.request_date) <= new Date(d.from_date), {
  message: 'Request Date must be before or equal to From Date',
  path: ['request_date'],
});
export type CreateLeaveRequestDtoType = z.infer<typeof CreateLeaveRequestDto>;

// ─────────────────────────────────────────────────────────────
// UPDATE  (PUT /leave-requests/:id)
// ─────────────────────────────────────────────────────────────

export const UpdateLeaveRequestDto = LeaveRequestBaseDto.partial().extend({
  pk_lr_id: numericId,
});
export type UpdateLeaveRequestDtoType = z.infer<typeof UpdateLeaveRequestDto>;

// ─────────────────────────────────────────────────────────────
// AUTHORIZE  (POST /leave-requests/:id/authorize)
// ─────────────────────────────────────────────────────────────

export const AuthorizeLeaveRequestDto = z.object({
  pk_lr_id: numericId,
  accepted: z.enum(['Accept', 'Reject']),
  a_remarks: z.string().max(200).optional().default(''),
  fk_a_user_id: numericId,
});
export type AuthorizeLeaveRequestDtoType = z.infer<typeof AuthorizeLeaveRequestDto>;

// ─────────────────────────────────────────────────────────────
// DELETE  (DELETE /leave-requests/:id)
// ─────────────────────────────────────────────────────────────

export const DeleteLeaveRequestDto = z.object({
  pk_lr_id: numericId,
  fk_user_id: numericId,
  fk_set_id: z.string().optional(),
});
export type DeleteLeaveRequestDtoType = z.infer<typeof DeleteLeaveRequestDto>;

// ─────────────────────────────────────────────────────────────
// EMPLOYEE LEAVE BALANCE QUERY
// ─────────────────────────────────────────────────────────────

export const EmployeeBalanceQueryDto = z.object({
  fk_emp_id: numericId,
  from_date: isoDate,
  to_date: isoDate,
  request_year: z.coerce.number().int().optional(),
  pk_lr_id: z.coerce.number().int().positive().optional(), // excluded when recalculating for an existing record
});
export type EmployeeBalanceQueryDtoType = z.infer<typeof EmployeeBalanceQueryDto>;

// ─────────────────────────────────────────────────────────────
// PARAMS
// ─────────────────────────────────────────────────────────────

export const IdParamDto = z.object({
  id: numericId,
});
export type IdParamDtoType = z.infer<typeof IdParamDto>;

// ─────────────────────────────────────────────────────────────
// UPDATE LEAVE BALANCE
// ─────────────────────────────────────────────────────────────

export const UpdateLeaveBalanceDto = z.object({
  year: z.coerce.number().int().optional().default(new Date().getFullYear()),
});
export type UpdateLeaveBalanceDtoType = z.infer<typeof UpdateLeaveBalanceDto>;
