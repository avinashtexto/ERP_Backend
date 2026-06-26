import { eq, sql, and, desc, asc, or } from 'drizzle-orm';
import {
  attendanceTable,
  attendanceLocationsTable,
  gpsAttendanceLogsTable,
  appUser,
  salEmployee,
  sal_attendance,
  sal_structure,
} from '@/shared/database/schemas/index.js';

import type {
  EmployeeIdentity,
  LocationResponse,
  PunchRequest,
  LiveLocationPayload,
  GPSAnalysisResult,
} from './attendance.types.js';

import { db } from '@/config/db.config.js';


// Custom GPS range error
export class GpsAttendanceError extends Error {
  statusCode: number;
  code: string;
  details: any;

  constructor(message: string, statusCode = 400, code = 'GPS_ATTENDANCE_ERROR', details = {}) {
    super(message);
    this.name = 'GpsAttendanceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// OFFICE_GEOFENCES static configuration has been replaced with database queries.

// Helper: Calculate Haversine distance in meters
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

// Helper: Resolve identity of employee to get code and name
export async function resolveEmployeeIdentity(userId: string | number): Promise<EmployeeIdentity> {
  if (userId === null || userId === undefined || userId === '') {
    return { empCode: null, empName: null, pkUserId: null, geolocationRequired: false };
  }

  const raw = String(userId).trim();

  // 1. Try treating as numerical fk_emp_id
  if (/^\d+$/.test(raw)) {
    const result = await db
      .select()
      .from(appUser)
      .where(eq(appUser.fk_emp_id, sql`${raw}::numeric`))
      .limit(1);
    const row = result[0];
    if (row) {
      // Check sal_employee for geolocation requirement and actual emp_code
      const salEmp = await db
        .select()
        .from(salEmployee)
        .where(eq(salEmployee.pk_emp_id, Number(raw)))
        .limit(1);
      const geolocationRequired = salEmp[0]?.geolocation === true;

      return {
        empCode: salEmp[0]?.emp_code || (row.fk_emp_id ? String(row.fk_emp_id) : null),
        empName: salEmp[0]?.employee || row.username,
        pkUserId: row.pk_user_id,
        geolocationRequired,
      };
    }
  }

  // 2. Try treating as numerical pk_user_id
  if (/^\d+$/.test(raw)) {
    const result = await db
      .select()
      .from(appUser)
      .where(eq(appUser.pk_user_id, Number(raw)))
      .limit(1);
    const row = result[0];
    if (row) {
      // Check sal_employee for geolocation requirement and actual emp_code
      const fkEmpId = row.fk_emp_id;
      if (fkEmpId) {
        const salEmp = await db
          .select()
          .from(salEmployee)
          .where(eq(salEmployee.pk_emp_id, Number(fkEmpId)))
          .limit(1);
        const geolocationRequired = salEmp[0]?.geolocation === true;

        return {
          empCode: salEmp[0]?.emp_code || (row.fk_emp_id ? String(row.fk_emp_id) : null),
          empName: salEmp[0]?.employee || row.username,
          pkUserId: row.pk_user_id,
          geolocationRequired,
        };
      }
    }
  }

  // 3. Try treating as username case-insensitive
  const result = await db
    .select()
    .from(appUser)
    .where(sql`LOWER(TRIM(${appUser.username})) = LOWER(${raw})`)
    .limit(1);
  const row = result[0];
  if (row) {
    // Check sal_employee for geolocation requirement and actual emp_code
    const fkEmpId = row.fk_emp_id;
    if (fkEmpId) {
      const salEmp = await db
        .select()
        .from(salEmployee)
        .where(eq(salEmployee.pk_emp_id, Number(fkEmpId)))
        .limit(1);
      const geolocationRequired = salEmp[0]?.geolocation === true;

      return {
        empCode: salEmp[0]?.emp_code || (row.fk_emp_id ? String(row.fk_emp_id) : null),
        empName: salEmp[0]?.employee || row.username,
        pkUserId: row.pk_user_id,
        geolocationRequired,
      };
    }
  }

  // 4. Try matching emp_code in sal_employee table (e.g. "EMP001")
  const salEmpRows = await db
    .select()
    .from(salEmployee)
    .where(sql`LOWER(TRIM(${salEmployee.emp_code})) = LOWER(${raw})`)
    .limit(1);
  const salEmpRow = salEmpRows[0];
  if (salEmpRow) {
    const geolocationRequired = salEmpRow.geolocation === true;
    // Try to find linked app_user
    const userRows = await db
      .select()
      .from(appUser)
      .where(eq(appUser.fk_emp_id, sql`${salEmpRow.pk_emp_id}::numeric`))
      .limit(1);
    const userRow = userRows[0];
    return {
      empCode: String(salEmpRow.pk_emp_id),
      empName: userRow?.username || salEmpRow.employee || null,
      pkUserId: userRow?.pk_user_id ?? null,
      geolocationRequired,
    };
  }

  return { empCode: null, empName: null, pkUserId: null, geolocationRequired: false };
}

// Helper: Resolve assigned office location for employee
export async function resolveOfficeLocation(locationId: number | null): Promise<any | null> {
  if (locationId) {
    const dbLocations = await db
      .select()
      .from(attendanceLocationsTable)
      .where(
        and(
          eq(attendanceLocationsTable.id, locationId),
          eq(attendanceLocationsTable.isActive, true),
        ),
      )
      .limit(1);
    if (dbLocations.length > 0) {
      const loc = dbLocations[0]!;
      return {
        locationId: loc.id,
        name: loc.locationName,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        radius: loc.allowedRadius ? Number(loc.allowedRadius) : 25,
        address: loc.address,
      };
    }
  }

  // Fallback: If specific ID is not active or found, get the first active location from database
  const activeLocations = await db
    .select()
    .from(attendanceLocationsTable)
    .where(eq(attendanceLocationsTable.isActive, true))
    .limit(1);
  if (activeLocations.length > 0) {
    const loc = activeLocations[0]!;
    return {
      locationId: loc.id,
      name: loc.locationName,
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      radius: loc.allowedRadius ? Number(loc.allowedRadius) : 25,
      address: loc.address,
    };
  }

  return null;
}

// Helper: Resolve all active office locations in system
export async function resolveAllOffices(): Promise<any[]> {
  const dbLocations = await db
    .select()
    .from(attendanceLocationsTable)
    .where(eq(attendanceLocationsTable.isActive, true));

  return dbLocations.map((loc) => ({
    locationId: loc.id,
    name: loc.locationName,
    latitude: Number(loc.latitude),
    longitude: Number(loc.longitude),
    radius: loc.allowedRadius ? Number(loc.allowedRadius) : 25,
    address: loc.address,
  }));
}

// Check if double punch exists today
export async function checkExistingPunchToday(empCode: string, status: string): Promise<boolean> {
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const result = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        or(
          eq(attendanceTable.empCode, empCode),
          eq(attendanceTable.empCode, String(empCode))
        ),
        eq(attendanceTable.punch, status),
        eq(attendanceTable.atDate, todayStr),
      ),
    )
    .limit(1);

  return result.length > 0;
}

// core markAttendance business logic
export async function markAttendance(
  params: PunchRequest & { requestUserId: string | number },
): Promise<any> {
  const userId = params.requestUserId || params.empCode || params.EmpCode;
  if (!userId) {
    throw new GpsAttendanceError('Employee identification is required', 401, 'UNAUTHORIZED');
  }

  const identity = await resolveEmployeeIdentity(userId);
  if (!identity.empCode) {
    throw new GpsAttendanceError(
      'Employee ID not found for attendance geofence',
      403,
      'EMPLOYEE_NOT_FOUND',
    );
  }

  const empCode = identity.empCode;
  const empName = identity.empName || 'Employee';
  const geolocationRequired = identity.geolocationRequired;

  // Smart status detection (normalize to Check IN, Check OUT, Break, Resume)
  const rawStatus = params.status || params.Status || params.punch || 'Check IN';
  let normalizedStatus = 'Check IN';
  const stLower = rawStatus.toLowerCase().trim();
  if (stLower.includes('out') || stLower.includes('checkout') || stLower.includes('punch_out')) {
    normalizedStatus = 'Check OUT';
  } else if (stLower.includes('break')) {
    normalizedStatus = 'Break';
  } else if (stLower.includes('resume')) {
    normalizedStatus = 'Resume';
  }

  // Parse and extract coordinates
  const latRaw = params.latitude ?? params.employee_latitude;
  const lonRaw = params.longitude ?? params.employee_longitude;
  if (latRaw === undefined || lonRaw === undefined || latRaw === '' || lonRaw === '') {
    throw new GpsAttendanceError('Latitude and Longitude are required', 400, 'MISSING_COORDINATES');
  }

  const numLat = Number(latRaw);
  const numLon = Number(lonRaw);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLon)) {
    throw new GpsAttendanceError('Invalid coordinates format', 400, 'INVALID_COORDINATES');
  }

  const rawAccuracy = params.accuracy;
  const accuracyMeters =
    rawAccuracy != null && Number.isFinite(Number(rawAccuracy)) ? Number(rawAccuracy) : 10.0;

  // Range check (skip geofence limit on Checkout punches)
  const isCheckout = normalizedStatus === 'Check OUT';

  // Resolve assigned user branch/location
  const userRows = await db
    .select()
    .from(appUser)
    .where(eq(appUser.pk_user_id, identity.pkUserId!))
    .limit(1);
  const matchedUser = userRows[0];
  const assignedLocationId = matchedUser?.fk_user_id ? Number(matchedUser.fk_user_id) : 1; // Default to 1 (Texto MBP Office)

  let resolvedOffice = await resolveOfficeLocation(assignedLocationId);
  let matchingRule = 'FIXED_OFFICE_GEOFENCE';

  if (!resolvedOffice) {
    const offices = await resolveAllOffices();
    let closestOffice = null;
    let minDistance = Infinity;

    for (const off of offices) {
      const distance = calculateDistance(numLat, numLon, off.latitude, off.longitude);
      if (distance <= off.radius) {
        resolvedOffice = off;
        matchingRule = 'DYNAMIC_CLOSEST_OFFICE_GEOFENCE';
        break;
      }
      if (distance < minDistance) {
        minDistance = distance;
        closestOffice = off;
      }
    }

    if (!resolvedOffice && closestOffice) {
      resolvedOffice = closestOffice;
      matchingRule = 'DYNAMIC_CLOSEST_OFFICE_GEOFENCE_FALLBACK';
    }
  }

  if (!resolvedOffice) {
    throw new GpsAttendanceError(
      'Office not assigned to employee. No office configurations exist.',
      404,
      'MISSING_OFFICE_ASSIGNMENT',
    );
  }

  const distance = calculateDistance(
    numLat,
    numLon,
    resolvedOffice.latitude,
    resolvedOffice.longitude,
  );
  const allowedRadius = resolvedOffice.radius || 25; // Use DB radius, default to 25m
  const withinRange = distance <= allowedRadius;

  const address = params.remark || resolvedOffice.address || 'Office Zone';

  // Daily punch limit checks
  if (normalizedStatus === 'Check IN' || normalizedStatus === 'Check OUT') {
    const alreadyExists = await checkExistingPunchToday(empCode, normalizedStatus);
    if (alreadyExists) {
      throw new GpsAttendanceError(
        `You have already recorded ${normalizedStatus} for today.`,
        400,
        'DUPLICATE_ATTENDANCE',
      );
    }
  }

  if (normalizedStatus === 'Check OUT') {
    const hasCheckIn = await checkExistingPunchToday(empCode, 'Check IN');
    if (!hasCheckIn) {
      throw new GpsAttendanceError('You must Check IN before Check OUT.', 400, 'MISSING_CHECK_IN');
    }
  }

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
  const attendanceStatus = withinRange || isCheckout ? 'approved' : 'rejected';

  // Geolocation check: only enforce if geolocationRequired is true
  if (geolocationRequired && !isCheckout && !withinRange) {
    // Save rejection log in gps_attendance_logs
    await db.insert(gpsAttendanceLogsTable).values({
      employeeId: empCode,
      attendanceType: 'GEOFENCE',
      attendanceDate: todayStr,
      recordedAt: new Date(),
      employeeLatitude: String(numLat),
      employeeLongitude: String(numLon),
      employeeAddress: address,
      officeLatitude: String(resolvedOffice.latitude),
      officeLongitude: String(resolvedOffice.longitude),
      distanceMeters: String(distance.toFixed(2)),
      allowedRadiusMeters: String(allowedRadius),
      attendanceStatus: 'rejected',
    });

    throw new GpsAttendanceError(
      `Attendance rejected. You are ${distance.toFixed(2)} meters from the office. Allowed radius is ${allowedRadius} meters.`,
      403,
      'OUT_OF_RANGE',
      {
        distance: `${distance.toFixed(2)}m`,
        allowed: `${allowedRadius}m`,
      },
    );
  }

  // Create transactions / double-save
  return await db.transaction(async (tx) => {
    // 1. Insert punch to main attendanceTable
    const punches = await tx
      .insert(attendanceTable)
      .values({
        payCode: empCode,
        empCode: empCode,
        empName: empName,
        atDate: todayStr,
        punchTime: timeStr,
        punchDatetime: new Date(),
        device: 'ReactNative',
        punch: normalizedStatus,
        manual: 'N',
        status: 1,
        latitude: String(numLat),
        longitude: String(numLon),
        address: address,
      })
      .returning();

    // 2. Insert to gpsAttendanceLogsTable for compliance
    await tx.insert(gpsAttendanceLogsTable).values({
      employeeId: empCode,
      attendanceType: 'GEOFENCE',
      attendanceDate: todayStr,
      recordedAt: new Date(),
      employeeLatitude: String(numLat),
      employeeLongitude: String(numLon),
      employeeAddress: address,
      officeLatitude: String(resolvedOffice.latitude),
      officeLongitude: String(resolvedOffice.longitude),
      distanceMeters: String(distance.toFixed(2)),
      allowedRadiusMeters: String(allowedRadius),
      attendanceStatus: 'approved',
    });

    return {
      success: true,
      punch: punches[0],
      location: {
        location_id: resolvedOffice.locationId,
        location_name: resolvedOffice.name,
        distance: `${distance.toFixed(2)}m`,
        allowed: `${allowedRadius}m`,
        withinRange,
      },
      geolocationRequired,
      geofenceEnforced: geolocationRequired,
    };
  });
}

// core recordLiveLocation business logic
export async function recordLiveLocation(
  userId: string | number,
  payload: LiveLocationPayload,
): Promise<any> {
  const identity = await resolveEmployeeIdentity(userId);
  if (!identity.empCode) {
    throw new GpsAttendanceError(
      'Only employees linked to SalEmployee can share live location.',
      403,
      'EMPLOYEE_NOT_FOUND',
    );
  }

  const empCode = identity.empCode;
  const empName = identity.empName || 'Employee';

  const latRaw =
    payload.latitude ?? payload.employee_latitude ?? payload.lat ?? payload.employeeLatitude;
  const lonRaw =
    payload.longitude ?? payload.employee_longitude ?? payload.lng ?? payload.employeeLongitude;

  if (latRaw === undefined || lonRaw === undefined || latRaw === '' || lonRaw === '') {
    throw new GpsAttendanceError(
      'Latitude and Longitude are required for coordinates logging',
      400,
      'MISSING_COORDINATES',
    );
  }

  const numLat = Number(latRaw);
  const numLon = Number(lonRaw);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLon)) {
    throw new GpsAttendanceError(
      'Invalid coordinates format for logging',
      400,
      'INVALID_COORDINATES',
    );
  }

  const accuracyMeters =
    payload.accuracy != null && Number.isFinite(Number(payload.accuracy))
      ? Number(payload.accuracy)
      : 15.0;

  // Resolve assigned user branch/location
  const userRows = await db
    .select()
    .from(appUser)
    .where(eq(appUser.pk_user_id, identity.pkUserId!))
    .limit(1);
  const matchedUser = userRows[0];
  const assignedLocationId = matchedUser?.fk_user_id ? Number(matchedUser.fk_user_id) : 1; // Default to 1 (Texto MBP Office)

  const resolvedOffice = await resolveOfficeLocation(assignedLocationId);
  if (!resolvedOffice) {
    throw new GpsAttendanceError(
      'Office location config not found in database',
      400,
      'LOCATION_NOT_FOUND',
    );
  }

  const distance = calculateDistance(
    numLat,
    numLon,
    resolvedOffice.latitude,
    resolvedOffice.longitude,
  );
  const allowedRadius = resolvedOffice.radius;
  const withinRange = distance <= allowedRadius;
  const attendanceStatus = withinRange ? 'approved' : 'rejected';

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const address = payload.address || 'Live Location Ping';

  // Log coordinate ping to database compliant with gps_attendance_logs
  const logRows = await db
    .insert(gpsAttendanceLogsTable)
    .values({
      employeeId: empCode,
      attendanceType: 'LIVE_TRACKING',
      attendanceDate: todayStr,
      recordedAt: new Date(),
      employeeLatitude: String(numLat),
      employeeLongitude: String(numLon),
      employeeAddress: address,
      officeLatitude: String(resolvedOffice.latitude),
      officeLongitude: String(resolvedOffice.longitude),
      distanceMeters: String(distance.toFixed(2)),
      allowedRadiusMeters: String(allowedRadius),
      attendanceStatus: attendanceStatus,
    })
    .returning();

  return {
    empCode,
    empName,
    latitude: numLat,
    longitude: numLon,
    accuracyMeters,
    recordedAt: logRows[0]?.recordedAt || new Date(),
    status: 'online',
    source: 'live_gps',
    locationId: resolvedOffice.locationId,
    officeName: resolvedOffice.name,
    distanceFromOfficeMeters: distance,
    allowedRadiusMeters: allowedRadius,
    isInsideOfficeRadius: withinRange,
    attendanceStatus,
  };
}

// Retrieve active online locations based on last 5 minutes logs
export async function getLiveLocations(search?: string): Promise<any[]> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const activeLogs = await db
    .select()
    .from(gpsAttendanceLogsTable)
    .where(
      and(
        eq(gpsAttendanceLogsTable.attendanceType, 'LIVE_TRACKING'),
        sql`${gpsAttendanceLogsTable.recordedAt} >= ${fiveMinutesAgo}`,
      ),
    )
    .orderBy(desc(gpsAttendanceLogsTable.recordedAt));

  // De-duplicate logs by employeeId, taking the latest coordinates
  const latestCoordinatesMap = new Map<string, typeof gpsAttendanceLogsTable.$inferSelect>();
  for (const log of activeLogs) {
    if (!latestCoordinatesMap.has(log.employeeId)) {
      latestCoordinatesMap.set(log.employeeId, log);
    }
  }

  const results: any[] = [];
  for (const [employeeId, log] of latestCoordinatesMap.entries()) {
    const identity = await resolveEmployeeIdentity(employeeId);
    const username = identity.empName || 'Employee';

    if (search) {
      const s = search.toLowerCase();
      if (!employeeId.toLowerCase().includes(s) && !username.toLowerCase().includes(s)) {
        continue;
      }
    }

    results.push({
      empCode: employeeId,
      empName: username,
      latitude: Number(log.employeeLatitude),
      longitude: Number(log.employeeLongitude),
      address: log.employeeAddress,
      lastActiveAt: log.recordedAt,
      status: 'online',
      source: 'live_gps',
    });
  }

  return results;
}

// Retrieve trail paths coordinates
export async function getEmployeeTrail(
  employeeId: string,
  limit = 100,
  sinceSeconds = 900,
): Promise<any> {
  const identity = await resolveEmployeeIdentity(employeeId);
  const empCode = identity.empCode || employeeId;
  const sinceTime = new Date(Date.now() - sinceSeconds * 1000);

  const logs = await db
    .select()
    .from(gpsAttendanceLogsTable)
    .where(
      and(
        eq(gpsAttendanceLogsTable.employeeId, empCode),
        eq(gpsAttendanceLogsTable.attendanceType, 'LIVE_TRACKING'),
        sql`${gpsAttendanceLogsTable.recordedAt} >= ${sinceTime}`,
      ),
    )
    .orderBy(desc(gpsAttendanceLogsTable.recordedAt))
    .limit(limit);

  return {
    empCode,
    empName: identity.empName || 'Employee',
    trail: logs.map((row) => ({
      id: row.id,
      latitude: Number(row.employeeLatitude),
      longitude: Number(row.employeeLongitude),
      address: row.employeeAddress,
      recordedAt: row.recordedAt,
    })),
  };
}

// Helper: Format duration into HHh MMm
function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
}

// Get attendance history sorted by date
export async function getAttendanceHistory(employeeId: string): Promise<any[]> {
  const identity = await resolveEmployeeIdentity(employeeId);
  const empCode = identity.empCode || employeeId;
  const fkEmpId = employeeId; // Keep the numeric ID for backward compatibility

  // Retrieve all logs - check both emp_code and fk_emp_id for backward compatibility
  const records = await db
    .select()
    .from(attendanceTable)
    .where(or(eq(attendanceTable.empCode, empCode), eq(attendanceTable.empCode, fkEmpId)))
    .orderBy(desc(attendanceTable.punchDatetime))
    .limit(500);

  // Fetch sal_attendance data for work types (half day, absent, etc.)
  let workTypeMap: Record<string, string> = {};
  try {
    const salAttendanceRecords = await db
      .select({
        at_date: sal_attendance.at_date,
        w_type: sal_attendance.w_type,
        authorize: sal_attendance.authorize,
      })
      .from(sal_attendance)
      .innerJoin(sal_structure, sql`${sal_attendance.fk_ss_id}::numeric = ${sal_structure.pk_ss_id}`)
      .where(sql`${sal_structure.fk_emp_id} = ${Number(fkEmpId)}`)
      .limit(500);

    // Create a map of work types by date
    workTypeMap = {};
    salAttendanceRecords.forEach((rec) => {
      if (rec.w_type && rec.at_date) {
        workTypeMap[rec.at_date] = rec.w_type;
      }
    });
  } catch (error) {
    // If sal_attendance query fails, continue with empty work type map
    console.warn('Failed to fetch sal_attendance data:', error);
    workTypeMap = {};
  }

  // Group records by atDate first
  const recordsByDate: Record<string, (typeof attendanceTable.$inferSelect)[]> = {};
  records.forEach((rec) => {
    let group = recordsByDate[rec.atDate];
    if (!group) {
      group = [];
      recordsByDate[rec.atDate] = group;
    }
    group.push(rec);
  });

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  // For each date, apply the auto-fill logic for missing check-out or resume on past dates
  Object.keys(recordsByDate).forEach((dateStr) => {
    // We only apply this default behavior for past dates
    if (dateStr >= todayStr) {
      return;
    }

    const dayPunches = recordsByDate[dateStr];
    if (!dayPunches || dayPunches.length === 0) {
      return;
    }

    // Sort ascending by time
    dayPunches.sort((a, b) => new Date(a.punchDatetime).getTime() - new Date(b.punchDatetime).getTime());

    const lastPunch = dayPunches[dayPunches.length - 1];
    if (!lastPunch) {
      return;
    }

    const status = lastPunch.punch || 'Check IN';

    if (status === 'Check IN' || status === 'Resume') {
      // Missing a Check OUT. Append virtual Check OUT.
      const defaultTime = new Date(`${dateStr}T18:30:00+05:30`);
      const lastPunchTime = new Date(lastPunch.punchDatetime);
      const virtualTime = lastPunchTime.getTime() > defaultTime.getTime() ? lastPunchTime : defaultTime;
      const timeStr = '18:30:00'; // Default checkout time display

      dayPunches.push({
        id: -lastPunch.id,
        payCode: lastPunch.payCode,
        empCode: lastPunch.empCode,
        empName: lastPunch.empName,
        atDate: dateStr,
        punchTime: timeStr,
        punchDatetime: virtualTime,
        device: 'System',
        punch: 'Check OUT',
        manual: 'N',
        status: 1,
        latitude: null,
        longitude: null,
        address: 'Auto Checkout (Default)',
      });
    } else if (status === 'Break') {
      // Missing a Resume AND Check OUT. Append virtual Resume and Check OUT.
      const defaultTime = new Date(`${dateStr}T18:30:00+05:30`);
      const lastPunchTime = new Date(lastPunch.punchDatetime);
      const virtualTime = lastPunchTime.getTime() > defaultTime.getTime() ? lastPunchTime : defaultTime;
      const timeStr = '18:30:00'; // Default resume/checkout time display

      // Append virtual Resume
      dayPunches.push({
        id: -lastPunch.id - 1,
        payCode: lastPunch.payCode,
        empCode: lastPunch.empCode,
        empName: lastPunch.empName,
        atDate: dateStr,
        punchTime: timeStr,
        punchDatetime: virtualTime,
        device: 'System',
        punch: 'Resume',
        manual: 'N',
        status: 1,
        latitude: null,
        longitude: null,
        address: 'Auto Resume (Default)',
      });

      // Append virtual Check OUT
      dayPunches.push({
        id: -lastPunch.id - 2,
        payCode: lastPunch.payCode,
        empCode: lastPunch.empCode,
        empName: lastPunch.empName,
        atDate: dateStr,
        punchTime: timeStr,
        punchDatetime: virtualTime,
        device: 'System',
        punch: 'Check OUT',
        manual: 'N',
        status: 1,
        latitude: null,
        longitude: null,
        address: 'Auto Checkout (Default)',
      });
    }
  });

  // Flatten the records back to a single array
  const processedRecords: (typeof attendanceTable.$inferSelect)[] = [];
  Object.values(recordsByDate).forEach((dayPunches) => {
    if (dayPunches) {
      processedRecords.push(...dayPunches);
    }
  });

  // Group by Date and calculate stats
  const dailyData: Record<
    string,
    {
      date: string;
      records: (typeof attendanceTable.$inferSelect)[];
      totalWorkMs: number;
      totalBreakMs: number;
      lastPunchTime: number | null;
      lastStatus: string | null;
    }
  > = {};

  // Sort logs by time ascending for work hours calculation
  const sortedRecords = [...processedRecords].sort(
    (a, b) => new Date(a.punchDatetime).getTime() - new Date(b.punchDatetime).getTime(),
  );

  sortedRecords.forEach((rec) => {
    const dt = new Date(rec.punchDatetime);
    const dateStr = rec.atDate; // e.g. YYYY-MM-DD

    let day = dailyData[dateStr];
    if (!day) {
      day = {
        date: dateStr,
        records: [],
        totalWorkMs: 0,
        totalBreakMs: 0,
        lastPunchTime: null,
        lastStatus: null,
      };
      dailyData[dateStr] = day;
    }

    const currentMs = dt.getTime();
    const status = rec.punch || 'Check IN';

    if (day.lastPunchTime !== null && day.lastStatus !== null) {
      const diff = currentMs - day.lastPunchTime;
      if (day.lastStatus === 'Check IN' || day.lastStatus === 'Resume') {
        day.totalWorkMs += diff;
      } else if (day.lastStatus === 'Break') {
        day.totalBreakMs += diff;
      }
    }

    day.lastPunchTime = currentMs;
    day.lastStatus = status;
    day.records.push(rec);
  });

  // Calculate live today stats if employee is checked in
  const todayDay = dailyData[todayStr];
  if (todayDay && todayDay.lastPunchTime !== null && todayDay.lastStatus !== null) {
    const currentMs = Date.now();
    const diff = currentMs - todayDay.lastPunchTime;
    if (todayDay.lastStatus === 'Check IN' || todayDay.lastStatus === 'Resume') {
      todayDay.totalWorkMs += diff;
    } else if (todayDay.lastStatus === 'Break') {
      todayDay.totalBreakMs += diff;
    }
  }

  // Format response details - include records for mobile app, but PDF uses only summary
  const result = Object.values(dailyData)
    .map((day) => ({
      date: day.date,
      totalWork: formatDuration(day.totalWorkMs),
      totalBreak: formatDuration(day.totalBreakMs),
      workType: workTypeMap[day.date] || 'Present',
      records: day.records.reverse().map((rec) => ({
        ...rec,
        Punch: rec.punch,
        PunchDatetime: rec.punchDatetime,
        PunchTime: rec.punchTime,
      })), // reverse to display newest first and map field names for mobile app
    }))
    .reverse();

  // Add missing dates from work type map (absent, half day, etc.)
  const allDates = new Set([...result.map(r => r.date), ...Object.keys(workTypeMap)]);
  const finalResult: any[] = [];

  allDates.forEach((dateStr) => {
    const existing = result.find(r => r.date === dateStr);
    if (existing) {
      finalResult.push(existing);
    } else {
      // Date has work type but no punch records
      finalResult.push({
        date: dateStr,
        totalWork: '00h 00m',
        totalBreak: '00h 00m',
        workType: workTypeMap[dateStr] || 'Absent',
        records: [],
      });
    }
  });

  return finalResult.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Retrieve employee current punch status
export async function getCurrentStatus(employeeId: string): Promise<any> {
  const identity = await resolveEmployeeIdentity(employeeId);
  if (!identity.empCode) {
    throw new GpsAttendanceError('Employee credentials invalid', 403, 'EMPLOYEE_NOT_FOUND');
  }

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const fkEmpId = employeeId; // Keep numeric ID for backward compatibility

  // Find last punch today - check both emp_code and fk_emp_id for backward compatibility
  const lastPunches = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        or(eq(attendanceTable.empCode, identity.empCode), eq(attendanceTable.empCode, fkEmpId)),
        eq(attendanceTable.atDate, todayStr),
      ),
    )
    .orderBy(desc(attendanceTable.punchDatetime))
    .limit(1);

  const lastPunch = lastPunches[0] || null;
  const status = lastPunch ? lastPunch.punch || 'Not Checked In' : 'Not Checked In';
  const lastPunchTime = lastPunch ? lastPunch.punchDatetime : null;
  const lastAddress = lastPunch ? lastPunch.address : null;

  const nextPunch = !lastPunch || lastPunch.punch === 'Check OUT' ? 'Check IN' : 'Check OUT';

  // Query all punches today to compute today's work and break hours
  const todayPunches = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        or(
          eq(attendanceTable.empCode, identity.empCode),
          eq(attendanceTable.empCode, fkEmpId)
        ),
        eq(attendanceTable.atDate, todayStr)
      )
    )
    .orderBy(asc(attendanceTable.punchDatetime));

  let totalWorkMs = 0;
  let totalBreakMs = 0;
  let lastPunchTimeMs: number | null = null;
  let lastPunchStatus: string | null = null;

  todayPunches.forEach((rec) => {
    const currentMs = new Date(rec.punchDatetime).getTime();
    const statusVal = rec.punch || 'Check IN';

    if (lastPunchTimeMs !== null && lastPunchStatus !== null) {
      const diff = currentMs - lastPunchTimeMs;
      if (lastPunchStatus === 'Check IN' || lastPunchStatus === 'Resume') {
        totalWorkMs += diff;
      } else if (lastPunchStatus === 'Break') {
        totalBreakMs += diff;
      }
    }

    lastPunchTimeMs = currentMs;
    lastPunchStatus = statusVal;
  });

  // Calculate live today stats if employee is checked in or on break
  if (lastPunchTimeMs !== null && lastPunchStatus !== null) {
    const currentMs = Date.now();
    const diff = currentMs - lastPunchTimeMs;
    if (lastPunchStatus === 'Check IN' || lastPunchStatus === 'Resume') {
      totalWorkMs += diff;
    } else if (lastPunchStatus === 'Break') {
      totalBreakMs += diff;
    }
  }

  // Resolve assigned user branch/location
  const userRows = await db
    .select()
    .from(appUser)
    .where(eq(appUser.pk_user_id, identity.pkUserId!))
    .limit(1);
  const matchedUser = userRows[0];
  const assignedLocationId = matchedUser?.fk_user_id ? Number(matchedUser.fk_user_id) : 1; // Default to 1 (Texto MBP Office)

  const office = await resolveOfficeLocation(assignedLocationId);
  if (!office) {
    throw new GpsAttendanceError(
      'Office location config not found in database',
      400,
      'LOCATION_NOT_FOUND',
    );
  }

  return {
    success: true,
    status,
    lastPunchTime,
    lastAddress,
    empCode: identity.empCode,
    empName: identity.empName,
    nextSuggestedPunch: nextPunch,
    office: {
      locationId: office.locationId,
      name: office.name,
      radius: office.radius,
    },
    todayWork: formatDuration(totalWorkMs),
    todayBreak: formatDuration(totalBreakMs),
  };
}

// Retrieve geofence radius configuration
export async function getAttendanceConfig(userId: string | number): Promise<any> {
  const identity = await resolveEmployeeIdentity(userId);
  const assignedLocationId = 1; // default to first office
  const office = await resolveOfficeLocation(assignedLocationId);
  if (!office) {
    throw new GpsAttendanceError(
      'Office location config not found in database',
      400,
      'LOCATION_NOT_FOUND',
    );
  }

  return {
    success: true,
    config: {
      locationId: office.locationId,
      officeName: office.name,
      radius: office.radius,
      assignedOffice: {
        locationId: office.locationId,
        name: office.name,
        radius: office.radius,
      },
    },
  };
}

// Fetch all geolocations (returns hardcoded data for now)
export async function getAllGeolocations(): Promise<any> {
  // Return hardcoded geolocation data without database changes
  const geolocations = [
    {
      pkGeoId: 1,
      OfficeName: 'Main Office',
      fkHLId: 1,
      Latitude: 19.096388750705227,
      Longitude: 73.01687580932347,
      RadiusMeters: 25,
      IsActive: true,
      CreatedAt: new Date().toISOString(),
      officeName: 'Main Office',
    },
    {
      pkGeoId: 2,
      OfficeName: 'Koparkhairne',
      fkHLId: 2,
      Latitude: 19.1026651,
      Longitude: 73.0090135,
      RadiusMeters: 25,
      IsActive: false,
      CreatedAt: new Date().toISOString(),
      officeName: 'Koparkhairne',
    },
    {
      pkGeoId: 3,
      OfficeName: 'Texto',
      fkHLId: 3,
      Latitude: 19.1110101,
      Longitude: 73.0155262,
      RadiusMeters: 25,
      IsActive: false,
      CreatedAt: new Date().toISOString(),
      officeName: 'Texto',
    },
  ];

  return {
    success: true,
    geolocations,
  };
}
