import type { Request, Response, NextFunction } from 'express';

import {
  LeaveRequestFilterDto,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  AuthorizeLeaveRequestDto,
  DeleteLeaveRequestDto,
  EmployeeBalanceQueryDto,
  UpdateLeaveBalanceDto,
  IdParamDto,
} from "./leave-request.dto.js";
import * as svc from "./leave-request.service.js";
import { db } from "../../config/db.config.js";
import { salEmployee } from "../../shared/database/schemas/index.js";
import { eq } from "drizzle-orm";
import { generateReportPDF } from "../../shared/utils/pdf-generator.js";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function currentFY() {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    from: `${year}-04-01`,
    to: `${year + 1}-03-31`,
  };
}

function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}

// ─────────────────────────────────────────────────────────────
// LIST   GET /leave-requests
// ─────────────────────────────────────────────────────────────

export async function listLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const fy = currentFY();
    const parsed = LeaveRequestFilterDto.safeParse({
      from_req_date: fy.from,
      to_req_date: fy.to,
      ...req.query,
    });
    if (!parsed.success) return fail(res, parsed.error.message);

    const result = await svc.getLeaveRequests(parsed.data);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// GET ONE   GET /leave-requests/:id
// ─────────────────────────────────────────────────────────────

export async function getLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = IdParamDto.safeParse(req.params);
    if (!parsed.success) return fail(res, 'Invalid ID');

    const record = await svc.getLeaveRequestById(parsed.data.id);
    if (!record) return fail(res, 'Record not found', 404);
    return ok(res, record);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// CREATE   POST /leave-requests
// ─────────────────────────────────────────────────────────────

export async function createLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateLeaveRequestDto.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.message);

    const fk_user_id = Number(((req as any).user?.id || (req as any).user?.pk_user_id) ?? 1);
    const pk_lr_id = await svc.createLeaveRequest(parsed.data, fk_user_id);
    return ok(res, { pk_lr_id }, 201);
  } catch (err: any) {
    if (err.message?.includes('already exists')) return fail(res, err.message, 409);
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE   PUT /leave-requests/:id
// ─────────────────────────────────────────────────────────────

export async function updateLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const id_parsed = IdParamDto.safeParse(req.params);
    if (!id_parsed.success) return fail(res, 'Invalid ID');

    const parsed = UpdateLeaveRequestDto.safeParse({
      ...req.body,
      pk_lr_id: id_parsed.data.id,
    });
    if (!parsed.success) return fail(res, parsed.error.message);

    const fk_user_id = Number(((req as any).user?.id || (req as any).user?.pk_user_id) ?? 1);
    await svc.updateLeaveRequest(parsed.data, fk_user_id);
    return ok(res, { updated: true });
  } catch (err: any) {
    if (err.message?.includes('already exists')) return fail(res, err.message, 409);
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE   DELETE /leave-requests/:id
// ─────────────────────────────────────────────────────────────

export async function deleteLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const id_parsed = IdParamDto.safeParse(req.params);
    if (!id_parsed.success) return fail(res, 'Invalid ID');

    const fk_user_id = Number(((req as any).user?.id || (req as any).user?.pk_user_id) ?? 1);
    const parsed = DeleteLeaveRequestDto.safeParse({
      pk_lr_id: id_parsed.data.id,
      fk_user_id,
    });
    if (!parsed.success) return fail(res, parsed.error.message);

    await svc.deleteLeaveRequest(parsed.data);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// AUTHORIZE   POST /leave-requests/:id/authorize
// ─────────────────────────────────────────────────────────────

export async function authorizeLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const id_parsed = IdParamDto.safeParse(req.params);
    if (!id_parsed.success) return fail(res, 'Invalid ID');

    const fk_a_user_id = Number(((req as any).user?.id || (req as any).user?.pk_user_id) ?? 1);
    const parsed = AuthorizeLeaveRequestDto.safeParse({
      ...req.body,
      pk_lr_id: id_parsed.data.id,
      fk_a_user_id,
    });
    if (!parsed.success) return fail(res, parsed.error.message);

    await svc.authorizeLeaveRequest(parsed.data);
    return ok(res, { authorized: true });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// EMPLOYEE LEAVE BALANCE   GET /leave-requests/balance
// ─────────────────────────────────────────────────────────────

export async function getLeaveBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = EmployeeBalanceQueryDto.safeParse(req.query);
    if (!parsed.success) return fail(res, parsed.error.message);

    const balance = await svc.getEmployeeLeaveBalance(parsed.data);
    return ok(res, balance);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// EMPLOYEE DROPDOWN   GET /leave-requests/employees
// ─────────────────────────────────────────────────────────────

export async function getEmployees(_req: Request, res: Response, next: NextFunction) {
  try {
    const employees = await svc.getEmployeeOptions();
    return ok(res, employees);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// LEAVE TYPES DROPDOWN   GET /leave-requests/leave-types
// ─────────────────────────────────────────────────────────────

export async function getLeaveTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await svc.getLeaveTypes();
    return ok(res, types);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE LEAVE BALANCE   POST /leave-requests/update-balance
// ─────────────────────────────────────────────────────────────

export async function updateLeaveBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdateLeaveBalanceDto.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.message);

    const result = await svc.updateLeaveBalanceForAllEmployees(parsed.data);
    return res.build
      .withStatus(200)
      .withModule('leave-requests')
      .withMessage('Leave balance updated successfully')
      .withData(result)
      .success()
      .send();
  } catch (err) {
    next(err);
  }
}

export async function getLeaveReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const requested_emp_code = req.query.fk_emp_id ? String(req.query.fk_emp_id) : '';
    if (!requested_emp_code) {
      res.status(400).json({ success: false, message: 'Employee identification parameter is required' });
      return;
    }

    const fy = currentFY();
    const parsed = LeaveRequestFilterDto.safeParse({
      from_req_date: fy.from,
      to_req_date: fy.to,
      ...req.query,
      page: 1,
      page_size: 500,
    });
    if (!parsed.success) return fail(res, parsed.error.message);

    const [emp] = await db
      .select({ employee: salEmployee.employee, emp_code: salEmployee.emp_code })
      .from(salEmployee)
      .where(eq(salEmployee.pk_emp_id, Number(requested_emp_code)))
      .limit(1);

    const emp_name = emp?.employee || 'Employee';
    const emp_code = emp?.emp_code || requested_emp_code;

    const result = await svc.getLeaveRequests(parsed.data);

    const columns = [
      { header: 'Req No.', width: 110, key: 'request_no' },
      { header: 'Req Date', width: 80, key: 'request_date' },
      { header: 'From Date', width: 80, key: 'from_date' },
      { header: 'To Date', width: 80, key: 'to_date' },
      { header: 'Days', width: 40, key: 'total_leave', align: 'center' as const },
      { header: 'Reason', width: 130, key: 'reason' },
      { header: 'Status', width: 70, key: 'last_status' },
    ];

    const format_date = (date_val?: string | Date) => {
      if (!date_val) return '';
      try {
        const d = new Date(date_val);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return String(date_val);
      }
    };

    const rows = result.data.map((item) => ({
      request_no: item.request_no,
      request_date: format_date(item.request_date),
      from_date: format_date(item.from_date),
      to_date: format_date(item.to_date),
      total_leave: item.total_leave,
      reason: item.reason,
      last_status: item.last_status,
    }));

    const pdf_buffer = await generateReportPDF(
      'Leave History Report',
      { name: emp_name, code: emp_code },
      columns,
      rows
    );

    const current_month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=leave_report_${current_month.replace(' ', '_')}.pdf`);
    res.send(pdf_buffer);
  } catch (err) {
    next(err);
  }
}

export async function getLeaveReportById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Leave request ID is required' });
      return;
    }

    const request_id = Array.isArray(id) ? id[0] : id;
    if (!request_id) {
      res.status(400).json({ success: false, message: 'Leave request ID is required' });
      return;
    }
    const result = await svc.getLeaveRequestById(Number(request_id));
    if (!result) {
      res.status(404).json({ success: false, message: 'Leave request not found' });
      return;
    }

    const [emp] = await db
      .select({ employee: salEmployee.employee, emp_code: salEmployee.emp_code })
      .from(salEmployee)
      .where(eq(salEmployee.pk_emp_id, Number(result.fk_emp_id)))
      .limit(1);

    const emp_name = emp?.employee || 'Employee';
    const emp_code = emp?.emp_code || String(result.fk_emp_id);

    const columns = [
      { header: 'Field', width: 120, key: 'field' },
      { header: 'Value', width: 200, key: 'value' },
    ];

    const format_date = (date_val?: string | Date) => {
      if (!date_val) return '';
      try {
        const d = new Date(date_val);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return String(date_val);
      }
    };

    const rows = [
      { field: 'Request No.', value: result.request_no },
      { field: 'Request Date', value: format_date(result.request_date) },
      { field: 'From Date', value: format_date(result.from_date) },
      { field: 'To Date', value: format_date(result.to_date) },
      { field: 'Total Days', value: result.total_leave },
      { field: 'Reason', value: result.reason },
      { field: 'Status', value: result.last_status },
      { field: 'Remarks', value: result.remarks || '' },
    ];

    const pdf_buffer = await generateReportPDF(
      'Leave Request Report',
      { name: emp_name, code: emp_code },
      columns,
      rows
    );

    const current_month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=leave_request_${id}_${current_month.replace(' ', '_')}.pdf`);
    res.send(pdf_buffer);
  } catch (err) {
    next(err);
  }
}
