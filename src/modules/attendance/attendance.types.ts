import {
  attendanceTable,
  gpsAttendanceLogsTable,
} from '@/shared/database/schemas/attendance.schema.js';

export type Attendance = typeof attendanceTable.$inferSelect;
export type NewAttendance = typeof attendanceTable.$inferInsert;

export type AttendanceLocation = {
  id: number;
  locationName: string;
  latitude: string;
  longitude: string;
  address: string | null;
  allowedRadius: string | null;
  locationType: string | null;
  isActive: boolean;
  fkHLId: number | null;
  createdAt: string | Date | null;
};
export type NewAttendanceLocation = Partial<AttendanceLocation>;

export type GpsAttendanceLog = typeof gpsAttendanceLogsTable.$inferSelect;
export type NewGpsAttendanceLog = typeof gpsAttendanceLogsTable.$inferInsert;

export interface EmployeeIdentity {
  empCode: string | null;
  empName: string | null;
  pkUserId: number | null;
  geolocationRequired: boolean;
}

export interface PunchRequest {
  empCode?: string | undefined;
  EmpCode?: string | undefined;
  status?: string | undefined;
  Status?: string | undefined;
  punch?: string | undefined;
  latitude?: number | string | undefined;
  longitude?: number | string | undefined;
  employee_latitude?: number | string | undefined;
  employee_longitude?: number | string | undefined;
  accuracy?: number | string | undefined;
  remark?: string | undefined;
}

export interface GeofenceAttendanceRequest {
  employeeId: string | number;
  lat: number | string;
  lng: number | string;
  status?: string | undefined;
}

export interface LiveLocationPayload {
  latitude?: number | string | undefined;
  employee_latitude?: number | string | undefined;
  lat?: number | string | undefined;
  employeeLatitude?: number | string | undefined;

  longitude?: number | string | undefined;
  employee_longitude?: number | string | undefined;
  lng?: number | string | undefined;
  employeeLongitude?: number | string | undefined;

  accuracy?: number | string | undefined;
  gps_accuracy?: number | string | undefined;

  heading?: number | string | undefined;
  speed?: number | string | undefined;
  address?: string | undefined;
  device_info?: string | undefined;
  deviceInfo?: string | undefined;
}

export interface GPSAnalysisResult {
  isSuspicious: boolean;
  riskScore: number;
  flags: string[];
  status: 'trusted' | 'suspicious';
}

export interface LocationResponse {
  location_type: string;
  location_id: number | null;
  location_name: string | null;
  allowed_radius: number | string | null;
  distance: number | null;
  withinRadius: boolean | null;
  geofenceEnforced: boolean;
  matching_rule: string;
  office: {
    locationId: number;
    name: string;
    radius: number;
  } | null;
  address: string | null;
}
