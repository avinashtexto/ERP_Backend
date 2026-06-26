import type { Request, Response, NextFunction } from "express";
import {
  PersonalWorkFilterDto,
  CreatePersonalWorkDto,
  AuthorizePersonalWorkDto,
} from "./personal-work.dto.js";
import * as svc from "./personal-work.service.js";

function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}

export async function listRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = PersonalWorkFilterDto.safeParse(req.query);
    if (!parsed.success) return fail(res, parsed.error.message);

    const currentUserIdVal = (req as any).user?.id || (req as any).user?.pk_user_id;
    const currentUserId = currentUserIdVal ? Number(currentUserIdVal) : undefined;

    const result = await svc.getPersonalWorkRequests(parsed.data, currentUserId);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return fail(res, "Invalid ID");

    const record = await svc.getPersonalWorkRequestById(id);
    if (!record) return fail(res, "Record not found", 404);
    return ok(res, record);
  } catch (err) {
    next(err);
  }
}

export async function createRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = CreatePersonalWorkDto.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.message);

    const currentUserIdVal = (req as any).user?.id || (req as any).user?.pk_user_id;
    if (!currentUserIdVal) return fail(res, "Unauthorized", 401);

    const fk_user_id = Number(currentUserIdVal);
    const pk_pw_id = await svc.createPersonalWorkRequest(parsed.data, fk_user_id);
    return ok(res, { pk_pw_id }, 201);
  } catch (err: any) {
    next(err);
  }
}

export async function authorizeRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return fail(res, "Invalid ID");

    const parsed = AuthorizePersonalWorkDto.safeParse({
      ...req.body,
      pk_pw_id: id,
    });
    if (!parsed.success) return fail(res, parsed.error.message);

    const currentUserIdVal = (req as any).user?.id || (req as any).user?.pk_user_id;
    if (!currentUserIdVal) return fail(res, "Unauthorized", 401);

    const fk_a_user_id = Number(currentUserIdVal);
    const authorized = await svc.authorizePersonalWorkRequest(parsed.data, fk_a_user_id);
    if (!authorized) return fail(res, "Record not found", 404);

    return ok(res, { authorized: true });
  } catch (err) {
    next(err);
  }
}

export async function deleteRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return fail(res, "Invalid ID");

    const deleted = await svc.deletePersonalWorkRequest(id);
    if (!deleted) return fail(res, "Record not found or not eligible for deletion", 400);

    return ok(res, { deleted: true });
  } catch (err: any) {
    return fail(res, err.message || "Failed to delete request");
  }
}

export async function updateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return fail(res, "Invalid ID");

    const currentUserIdVal = (req as any).user?.id || (req as any).user?.pk_user_id;
    if (!currentUserIdVal) return fail(res, "Unauthorized", 401);

    // Partial parse – allow subset of CreatePersonalWorkDto
    const parsed = CreatePersonalWorkDto.partial().safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.message);

    const fk_user_id = Number(currentUserIdVal);
    const updated = await svc.updatePersonalWorkRequest(id, parsed.data as any, fk_user_id);
    if (!updated) return fail(res, "Record not found", 404);

    return ok(res, { updated: true });
  } catch (err: any) {
    return fail(res, err.message || "Failed to update request");
  }
}

export async function getShiftEndTimeForEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const fk_emp_id = Number(req.query.fk_emp_id);
    if (isNaN(fk_emp_id)) return fail(res, "Invalid fk_emp_id");

    const shiftInfo = await svc.getEmployeeShiftEndTime(fk_emp_id);
    if (!shiftInfo) return ok(res, { shiftEnd: null });

    // Return only the time portion as HH:MM (24h) so mobile can parse it
    const eWork = new Date(shiftInfo.e_work);
    const hh = String(eWork.getHours()).padStart(2, '0');
    const mm = String(eWork.getMinutes()).padStart(2, '0');
    return ok(res, { shiftEnd: `${hh}:${mm}`, shift: shiftInfo.shift });
  } catch (err) {
    next(err);
  }
}
