// ─────────────────────────────────────────────
//  users.controller.ts
//  HTTP handlers — thin layer, delegates to service
// ─────────────────────────────────────────────

import { type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';

import * as UserService from './users.service.js';
import { type UserFilterParams } from './users.types.js';

// Helper: extract current user ID from request (set by auth middleware)
function currentUserId(req: Request): string {
  const user = (req as Request & { user?: any }).user;
  return user?.id?.toString() || user?.pk_user_id?.toString() || user?.pkUserId?.toString() || '';
}

// Helper: Format users for Excel/CSV export
function formatRowsForExport(rows: any[]) {
  return rows.map((row) => ({
    'User ID': row.pk_user_id,
    Username: row.username,
    Employee: row.employee || '',
    Mobile: row.mobile || '',
    'Last Status': row.last_status || '',
    'Date/Time': row.date_time_stamp ? new Date(row.date_time_stamp).toLocaleString() : '',
    'Created By': row.creator || '',
  }));
}

// ── GET /users ────────────────────────────────
export const listUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters: UserFilterParams = {
    ...(req.query.username && { username: req.query.username as string }),
    ...(req.query.employee && { employee: req.query.employee as string }),
    ...(req.query.creator && { creator: req.query.creator as string }),
    ...(req.query.last_status && { last_status: req.query.last_status as string }),
    ...(req.query.date_time_stamp && { date_time_stamp: req.query.date_time_stamp as string }),
  };
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 50;

  const result = await UserService.getUsers(filters, page, pageSize, currentUserId(req));

  res.build
    .withStatus(200)
    .withModule('users')
    .withMessage('Users retrieved successfully')
    .withData(result.data)
    .withMeta({
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    })
    .success()
    .send();
});

// ── GET /users/:id ────────────────────────────
export const getUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await UserService.get(req.params.id as string);
  if (!user) {
    res.build.withStatus(404).withError('NOT_FOUND', 'User not found.').fail().send();
    return;
  }
  res.build
    .withStatus(200)
    .withModule('users')
    .withMessage('User retrieved successfully')
    .withData(user)
    .success()
    .send();
});

// ── POST /users ───────────────────────────────
export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const taken = await UserService.isUserNameTaken(req.body.username);
  if (taken) {
    res.build
      .withStatus(409)
      .withError('ALREADY_EXISTS', `${req.body.username} already exists.`)
      .fail()
      .send();
    return;
  }

  const newUser = await UserService.createUser(req.body, currentUserId(req));
  res.build
    .withStatus(201)
    .withModule('users')
    .withMessage(`${req.body.username} is saved.`)
    .withData(newUser)
    .success()
    .send();
});

// ── PUT /users/:id ────────────────────────────
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (req.body.username) {
    const taken = await UserService.isUserNameTaken(req.body.username, req.params.id as string);
    if (taken) {
      res.build
        .withStatus(409)
        .withError('ALREADY_EXISTS', `${req.body.username} already exists.`)
        .fail()
        .send();
      return;
    }
  }

  try {
    const updated = await UserService.updateUser(
      req.params.id as string,
      req.body,
      currentUserId(req),
    );

    res.build
      .withStatus(200)
      .withModule('users')
      .withMessage(`${updated?.username || ''} is saved.`)
      .withData(updated)
      .success()
      .send();
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("can't change") || msg.includes('not found')) {
      res.build.withStatus(403).withError('FORBIDDEN', msg).fail().send();
      return;
    }
    throw err;
  }
});

// ── DELETE /users/:id ─────────────────────────
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    await UserService.deleteUser(req.params.id as string, currentUserId(req));
    res.build.withStatus(200).withModule('users').withMessage('User is deleted.').success().send();
  } catch (err) {
    const msg = (err as Error).message;
    res.build.withStatus(500).withError('DELETE_FAILED', msg).fail().send();
  }
});

// ── GET /users/export ─────────────────────────
export const exportUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters: UserFilterParams = {
    ...(req.query.username && { username: req.query.username as string }),
    ...(req.query.employee && { employee: req.query.employee as string }),
    ...(req.query.creator && { creator: req.query.creator as string }),
    ...(req.query.last_status && { last_status: req.query.last_status as string }),
    ...(req.query.date_time_stamp && { date_time_stamp: req.query.date_time_stamp as string }),
  };

  const rows = await UserService.getAllUsersForExport(filters, currentUserId(req));

  if (rows.length === 0) {
    res.build
      .withStatus(200)
      .withMessage('There is no single record to export.')
      .withData([])
      .success()
      .send();
    return;
  }

  const exportData = formatRowsForExport(rows);
  res.build
    .withStatus(200)
    .withModule('users')
    .withMessage('Users exported successfully')
    .withData(exportData)
    .withMeta({ total: exportData.length })
    .success()
    .send();
});

// ════════════════════════════════════════════
//  LOOKUP CONTROLLERS
// ════════════════════════════════════════════

// ── GET /users/lookups/employees ─────────────
export const getEmployees = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = {
    ...(req.query.employee && { employee: req.query.employee as string }),
    ...(req.query.emp_code && { emp_code: req.query.emp_code as string }),
  };
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 100;

  const result = await UserService.getEmployees(filters, page, pageSize);
  res.build
    .withStatus(200)
    .withModule('users')
    .withMessage('Employees list retrieved successfully')
    .withData(result.data)
    .withMeta({
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    })
    .success()
    .send();
});

// ── GET /users/lookups/email-configurations ───
export const getEmailConfigurations = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const data = await UserService.getEmailConfigurations();
    res.build
      .withStatus(200)
      .withModule('users')
      .withMessage('Email configurations retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

// ── GET /users/lookups/security-questions ─────
export const getSecurityQuestions = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const data = await UserService.getSecurityQuestions();
    res.build
      .withStatus(200)
      .withModule('users')
      .withMessage('Security questions retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

// ── GET /attendance/employee/:id (Mobile Profile) ─────
export const getEmployeeProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const empId = req.params.id as string;
    let user = await UserService.getByEmpId(empId);
    if (!user) {
      const authUserId = currentUserId(req);
      console.log('[Debug Profile Fallback] empId not found:', empId, 'authUserId:', authUserId);
      if (authUserId) {
        const authUser = await UserService.get(authUserId);
        console.log('[Debug Profile Fallback] authUser:', authUser);
        if (authUser && authUser.fk_emp_id) {
          console.log(
            '[Debug Profile Fallback] Trying getByEmpId with fk_emp_id:',
            authUser.fk_emp_id,
          );
          user = await UserService.getByEmpId(authUser.fk_emp_id);
          console.log('[Debug Profile Fallback] getByEmpId result:', user);
        }
      }
    }

    if (!user) {
      res.build.withStatus(404).withError('NOT_FOUND', 'Employee profile not found.').fail().send();
      return;
    }

    const profile = {
      pkUserId: String(user.pk_user_id || user.fk_emp_id),
      userName: user.employee || user.username,
      fkEmpId: user.fk_emp_id,
      email: user.email,
      phone: user.mobile,
      profileImageUrl: user.photo || null,
      empCode: user.emp_code || null,
      // Additional fields from sal_employee
      doj: user.doj || null,
      dob: user.dob || null,
      bloodGroup: user.blood_grp || null,
      aadhar: user.aadhar || null,
      panNo: user.pan_no || null,
      permanentAddress: user.p_address || null,
      presentAddress: user.n_address || null,
      pfNo: user.pf_no || null,
      esicNo: user.esic_no || null,
      accountNo: user.account_no || null,
      employmentType: user.type || null,
      gender: user.gender || null,
      maritalStatus: user.martial_status || null,
      experience: user.experience || null,
    };

    res.build
      .withStatus(200)
      .withModule('users')
      .withMessage('Profile retrieved successfully')
      .withData({ profile })
      .success()
      .send();
  },
);

// ── PUT /attendance/employee/:id (Mobile Profile Update) ───
export const updateEmployeeProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let empId = req.params.id as string;
    const { userName, email, phone, profileImageUrl, dob, bloodGroup, permanentAddress, presentAddress } = req.body;

    const user = await UserService.getByEmpId(empId);
    if (!user) {
      const authUserId = currentUserId(req);
      if (authUserId) {
        const authUser = await UserService.get(authUserId);
        if (authUser && authUser.fk_emp_id) {
          empId = String(authUser.fk_emp_id);
        }
      }
    }

    try {
      const updated = await UserService.updateByEmpId(
        empId,
        {
          employeeName: userName,
          email,
          mobile: phone,
          profileImageUrl,
          dob,
          bloodGroup,
          permanentAddress,
          presentAddress,
        },
        currentUserId(req),
      );

      if (!updated) {
        res.build.withStatus(404).withError('NOT_FOUND', 'Profile update failed.').fail().send();
        return;
      }

      const profile = {
        pkUserId: String(updated.pk_user_id || updated.fk_emp_id),
        userName: updated.employee || updated.username,
        fkEmpId: updated.fk_emp_id,
        email: updated.email,
        phone: updated.mobile,
        profileImageUrl: updated.photo || null,
        empCode: updated.emp_code || null,
        // Additional fields from sal_employee
        doj: updated.doj || null,
        dob: updated.dob || null,
        bloodGroup: updated.blood_grp || null,
        aadhar: updated.aadhar || null,
        panNo: updated.pan_no || null,
        permanentAddress: updated.p_address || null,
        presentAddress: updated.n_address || null,
        pfNo: updated.pf_no || null,
        esicNo: updated.esic_no || null,
        accountNo: updated.account_no || null,
        employmentType: updated.type || null,
        gender: updated.gender || null,
        maritalStatus: updated.martial_status || null,
        experience: updated.experience || null,
      };

      res.build
        .withStatus(200)
        .withModule('users')
        .withMessage('Profile updated successfully')
        .withData({ profile })
        .success()
        .send();
    } catch (err) {
      const msg = (err as Error).message;
      res.build.withStatus(400).withError('BAD_REQUEST', msg).fail().send();
    }
  },
);

// ── POST /attendance/profile/image (Mobile Profile Image Upload) ───
export const uploadProfileImage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUserId = currentUserId(req);
    if (!authUserId) {
      res.build.withStatus(401).withError('UNAUTHORIZED', 'Authentication required.').fail().send();
      return;
    }

    if (!req.file) {
      res.build.withStatus(400).withError('BAD_REQUEST', 'No image file uploaded.').fail().send();
      return;
    }

    const empId = authUserId;
    const user = await UserService.getByEmpId(empId);
    if (!user) {
      res.build.withStatus(404).withError('NOT_FOUND', 'Employee profile not found.').fail().send();
      return;
    }

    try {
      // The file was saved by multer to public/uploads/profile/
      // The relative path we store in the DB is e.g. /uploads/profile/filename.jpg
      const profileImageUrl = `/uploads/profile/${req.file.filename}`;

      // Update the employee profile with the new photo URL
      const updated = await UserService.updateByEmpId(
        empId,
        {
          profileImageUrl,
        },
        authUserId,
      );

      if (!updated) {
        res.build.withStatus(404).withError('NOT_FOUND', 'Profile image update failed.').fail().send();
        return;
      }

      const profile = {
        pkUserId: String(updated.pk_user_id || updated.fk_emp_id),
        userName: updated.employee || updated.username,
        fkEmpId: updated.fk_emp_id,
        email: updated.email,
        phone: updated.mobile,
        profileImageUrl: updated.photo || null,
        empCode: updated.emp_code || null,
        // Additional fields from sal_employee
        doj: updated.doj || null,
        dob: updated.dob || null,
        bloodGroup: updated.blood_grp || null,
        aadhar: updated.aadhar || null,
        panNo: updated.pan_no || null,
        permanentAddress: updated.p_address || null,
        presentAddress: updated.n_address || null,
        pfNo: updated.pf_no || null,
        esicNo: updated.esic_no || null,
        accountNo: updated.account_no || null,
        employmentType: updated.type || null,
        gender: updated.gender || null,
        maritalStatus: updated.martial_status || null,
        experience: updated.experience || null,
      };

      res.build
        .withStatus(200)
        .withModule('users')
        .withMessage('Profile image updated successfully')
        .withData({ profile })
        .success()
        .send();
    } catch (err) {
      const msg = (err as Error).message;
      res.build.withStatus(400).withError('BAD_REQUEST', msg).fail().send();
    }
  },
);

export const registerDeviceToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userIdStr = currentUserId(req);
  if (!userIdStr) {
    res.build.withStatus(401).withError('UNAUTHORIZED', 'Invalid or missing user session.').fail().send();
    return;
  }
  
  const userId = parseInt(userIdStr, 10);
  const { device_token, device_type } = req.body;
  
  await UserService.registerDeviceToken(userId, device_token, device_type);
  
  res.build
    .withStatus(200)
    .withModule('users')
    .withMessage('Device token registered successfully.')
    .withData(null)
    .success()
    .send();
});

