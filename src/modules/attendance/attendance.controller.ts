import type { Request, Response } from 'express';

import {
  punchRequestSchema,
  geofenceAttendanceRequestSchema,
  liveLocationRequestSchema,
} from './attendance.dto.js';
import * as service from './attendance.service.js';

import { logger } from '@/shared/utils/devHelper.js';
import { db } from '../../config/db.config.js';
import { salEmployee, contDepartment, contDesignation } from '../../shared/database/schemas/index.js';
import { eq } from 'drizzle-orm';
import { generateReportPDF } from '../../shared/utils/pdf-generator.js';

// Custom interface for Request with authenticated user context
interface AuthenticatedRequest extends Request {
  user?: {
    id: string | number;
    username?: string;
    role?: string;
    fk_emp_id?: string | number;
  };
}

// Helper: Clean undefined keys from parsed object to respect exactOptionalPropertyTypes
function cleanObject<T extends object>(obj: T): T {
  const result = {} as any;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export async function health(req: Request, res: Response): Promise<void> {
  try {
    const dbLocs = await service.resolveAllOffices();
    res.build
      .withStatus(200)
      .withMessage('Attendance module is operational')
      .withData({
        module: 'attendance',
        status: 'ok',
        activeGeofenceCount: dbLocs.length,
      })
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('HEALTH_CHECK_FAILED', error.message).fail().send();
  }
}

// markAttendance controller
export async function punch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = cleanObject(punchRequestSchema.parse(req.body));
    const requestUserId = req.user 
      ? (req.user.fk_emp_id ?? req.user.id) 
      : validated.empCode || validated.EmpCode;
    
    const userId = requestUserId;
    logger.info('Punch IN Request:', { userId, validated });

    if (!userId) {
      res.build
        .withStatus(401)
        .withError('UNAUTHORIZED', 'Employee credentials not provided')
        .fail()
        .send();
      return;
    }

    const result = await service.markAttendance({
      ...validated,
      requestUserId: userId,
    });

    logger.info('Punch IN Result:', result);

    res.build
      .withStatus(201)
      .withMessage(`${result.punch.punch} recorded successfully`)
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    logger.error('Attendance Punch Error:', error);
    const statusCode = error.statusCode || 400;
    const errorCode = error.code || 'PUNCH_FAILED';
    res.build
      .withStatus(statusCode)
      .withMessage(error.message)
      .withError(errorCode, error.message)
      .fail()
      .send();
  }
}

// geofence controller
export async function markGeofenceAttendance(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const validated = geofenceAttendanceRequestSchema.parse(req.body);
    const result = await service.markAttendance({
      requestUserId: validated.employeeId,
      latitude: validated.lat,
      longitude: validated.lng,
      status: validated.status || 'Check IN',
    });

    res.build
      .withStatus(201)
      .withMessage('Geofence attendance marked')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    const errorCode = error.code || 'GEOFENCE_FAILED';
    res.build.withStatus(statusCode).withError(errorCode, error.message).fail().send();
  }
}

// checkout controller
export async function checkout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = cleanObject(punchRequestSchema.parse(req.body));
    const userId = req.user ? (req.user.fk_emp_id ?? req.user.id) : validated.empCode || validated.EmpCode;

    logger.info('Checkout Request:', { userId, validated });

    if (!userId) {
      res.build
        .withStatus(401)
        .withError('UNAUTHORIZED', 'Employee credentials not provided')
        .fail()
        .send();
      return;
    }

    const result = await service.markAttendance({
      ...validated,
      status: 'Check OUT',
      requestUserId: userId,
    });

    logger.info('Checkout Result:', result);

    res.build
      .withStatus(201)
      .withMessage('Check OUT recorded successfully')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    logger.error('Attendance Checkout Error:', error);
    const statusCode = error.statusCode || 400;
    const errorCode = error.code || 'CHECKOUT_FAILED';
    res.build
      .withStatus(statusCode)
      .withMessage(error.message)
      .withError(errorCode, error.message)
      .fail()
      .send();
  }
}

// getHistory controller
export async function getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const requestedEmpCode = req.params.empCode
      ? String(req.params.empCode)
      : req.user
        ? String(req.user.fk_emp_id || req.user.id)
        : '';
    if (!requestedEmpCode) {
      res.build
        .withStatus(400)
        .withError('MISSING_EMPLOYEE_ID', 'Employee identification parameter is required')
        .fail()
        .send();
      return;
    }

    const history = await service.getAttendanceHistory(requestedEmpCode);
    res.build
      .withStatus(200)
      .withMessage('Attendance history retrieved successfully')
      .withData(history)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('HISTORY_FAILED', error.message).fail().send();
  }
}

// getConfig controller
export async function getAttendanceConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user ? (req.user.fk_emp_id ?? req.user.id) : 1;
    const config = await service.getAttendanceConfig(userId);

    res.build
      .withStatus(200)
      .withMessage('Attendance config retrieved')
      .withData(config)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('CONFIG_FAILED', error.message).fail().send();
  }
}

// getStatus controller
export async function getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.empCode
      ? String(req.params.empCode)
      : req.user
        ? String(req.user.fk_emp_id ?? req.user.id)
        : '';
    
    logger.info('Get Status Request:', { userId, params: req.params, user: req.user });

    if (!userId) {
      res.build
        .withStatus(400)
        .withError('MISSING_EMPLOYEE_ID', 'Employee credentials not provided')
        .fail()
        .send();
      return;
    }

    let statusInfo;
    try {
      statusInfo = await service.getCurrentStatus(userId);
      logger.info('Get Status Result:', statusInfo);
    } catch (error: any) {
      const authUserId = req.user ? String(req.user.fk_emp_id ?? req.user.id) : '';
      if (error.code === 'EMPLOYEE_NOT_FOUND' && authUserId && userId !== authUserId) {
        statusInfo = await service.getCurrentStatus(authUserId);
        logger.info('Get Status Result (fallback):', statusInfo);
      } else {
        throw error;
      }
    }

    res.build
      .withStatus(200)
      .withMessage('Current status computed')
      .withData(statusInfo)
      .success()
      .send();
  } catch (error: any) {
    logger.error('Attendance Status Error:', error);
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || 'STATUS_FAILED';
    res.build
      .withStatus(statusCode)
      .withMessage(error.message)
      .withError(errorCode, error.message)
      .fail()
      .send();
  }
}

// postLiveLocation controller
export async function postLiveLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = cleanObject(liveLocationRequestSchema.parse(req.body));
    const userId = req.user ? (req.user.fk_emp_id ?? req.user.id) : null;

    if (!userId) {
      res.build
        .withStatus(401)
        .withError('UNAUTHORIZED', 'Employee session is required')
        .fail()
        .send();
      return;
    }

    const point = await service.recordLiveLocation(userId, validated);
    res.build
      .withStatus(201)
      .withMessage('Live location coordinates recorded')
      .withData(point)
      .success()
      .send();
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    const errorCode = error.code || 'LIVE_LOCATION_PING_FAILED';
    res.build.withStatus(statusCode).withError(errorCode, error.message).fail().send();
  }
}

// getLiveLocations controller
export async function getLiveLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const locations = await service.getLiveLocations(search);

    res.build
      .withStatus(200)
      .withMessage('Active live locations retrieved')
      .withData(locations)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('GET_LIVE_LOCATIONS_FAILED', error.message).fail().send();
  }
}

// getEmployeeTrail controller
export async function getEmployeeTrail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const employeeId = req.params.employeeId ? String(req.params.employeeId) : '';
    if (!employeeId) {
      res.build
        .withStatus(400)
        .withError('MISSING_EMPLOYEE_ID', 'Employee credentials not provided')
        .fail()
        .send();
      return;
    }

    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const sinceSeconds = req.query.sinceSeconds ? Number(req.query.sinceSeconds) : 900;

    const trail = await service.getEmployeeTrail(employeeId, limit, sinceSeconds);
    res.build
      .withStatus(200)
      .withMessage('Employee trail coordinate logs retrieved')
      .withData(trail)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('GET_TRAIL_FAILED', error.message).fail().send();
  }
}

export async function getAttendanceReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const requestedEmpCode = req.query.fk_emp_id
      ? String(req.query.fk_emp_id)
      : req.user
        ? String(req.user.fk_emp_id || req.user.id)
        : '';
    if (!requestedEmpCode) {
      res.status(400).json({ success: false, message: 'Employee identification parameter is required' });
      return;
    }

    // Fetch employee details with hierarchy information
    const [emp] = await db
      .select({
        employee: salEmployee.employee,
        emp_code: salEmployee.emp_code,
        fk_dep_id: salEmployee.fk_dep_id,
        fk_deg_id: salEmployee.fk_deg_id,
        fk_r_emp_id: salEmployee.fk_r_emp_id,
      })
      .from(salEmployee)
      .where(eq(salEmployee.pk_emp_id, Number(requestedEmpCode)))
      .limit(1);

    const empName = emp?.employee || 'Employee';
    const empCode = emp?.emp_code || requestedEmpCode;

    // Fetch hierarchy details
    let hierarchyInfo: any = {};
    if (emp?.fk_dep_id) {
      const [dept] = await db
        .select({ department: contDepartment.department })
        .from(contDepartment)
        .where(eq(contDepartment.pk_dep_id, Number(emp.fk_dep_id)))
        .limit(1);
      if (dept) hierarchyInfo.department = dept.department;
    }

    if (emp?.fk_deg_id) {
      const [deg] = await db
        .select({ designation: contDesignation.designation })
        .from(contDesignation)
        .where(eq(contDesignation.pk_des_id, Number(emp.fk_deg_id)))
        .limit(1);
      if (deg) hierarchyInfo.designation = deg.designation;
    }

    if (emp?.fk_r_emp_id) {
      const [reportingTo] = await db
        .select({ employee: salEmployee.employee })
        .from(salEmployee)
        .where(eq(salEmployee.pk_emp_id, Number(emp.fk_r_emp_id)))
        .limit(1);
      if (reportingTo) hierarchyInfo.reportingTo = reportingTo.employee;
    }

    // Fetch history
    const history = await service.getAttendanceHistory(requestedEmpCode);

    // Columns
    const columns = [
      { header: 'Date', width: 100, key: 'date' },
      { header: 'Work Type', width: 100, key: 'workType' },
      { header: 'In Time', width: 100, key: 'inTime' },
      { header: 'Out Time', width: 100, key: 'outTime' },
      { header: 'Work Hours', width: 100, key: 'totalWork' },
      { header: 'Break Hours', width: 100, key: 'totalBreak' },
    ];

    // Helper: format rows - only daily summary, no individual punch logs
    const rows = history.map((day) => {
      const inPunch = day.records?.find((r: any) => r.Punch === 'Check IN');
      const outPunch = day.records ? [...day.records].reverse().find((r: any) => r.Punch === 'Check OUT') : undefined;

      const formatTime = (isoString?: string) => {
        if (!isoString) return '--:--';
        try {
          const date = new Date(isoString);
          let hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          const minsStr = minutes < 10 ? '0' + minutes : minutes;
          return `${hours}:${minsStr} ${ampm}`;
        } catch {
          return '--:--';
        }
      };

      return {
        date: day.date,
        workType: day.workType || 'Present',
        inTime: formatTime(inPunch?.PunchDatetime),
        outTime: formatTime(outPunch?.PunchDatetime),
        totalWork: day.totalWork || '00h 00m',
        totalBreak: day.totalBreak || '00h 00m',
      };
    });

    const pdfBuffer = await generateReportPDF(
      'Attendance Report',
      { name: empName, code: empCode },
      columns,
      rows,
      hierarchyInfo
    );

    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${currentMonth.replace(' ', '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getGeolocations(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.getAllGeolocations();
    res.build
      .withStatus(200)
      .withMessage('Geolocations retrieved successfully')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withError('FETCH_GEOLOCATIONS_FAILED', error.message)
      .fail()
      .send();
  }
}
