import { z } from 'zod';

export const punchRequestSchema = z.object({
  empCode: z.string().optional(),
  EmpCode: z.string().optional(),
  status: z.string().optional(),
  Status: z.string().optional(),
  punch: z.string().optional(),
  latitude: z.union([z.number(), z.string()]).optional(),
  longitude: z.union([z.number(), z.string()]).optional(),
  employee_latitude: z.union([z.number(), z.string()]).optional(),
  employee_longitude: z.union([z.number(), z.string()]).optional(),
  accuracy: z.union([z.number(), z.string()]).optional(),
  remark: z.string().optional(),
});

export const geofenceAttendanceRequestSchema = z.object({
  employeeId: z.union([z.number(), z.string()]),
  lat: z.union([z.number(), z.string()]),
  lng: z.union([z.number(), z.string()]),
  status: z.string().optional(),
});

export const liveLocationRequestSchema = z.object({
  latitude: z.union([z.number(), z.string()]).optional(),
  employee_latitude: z.union([z.number(), z.string()]).optional(),
  lat: z.union([z.number(), z.string()]).optional(),
  employeeLatitude: z.union([z.number(), z.string()]).optional(),

  longitude: z.union([z.number(), z.string()]).optional(),
  employee_longitude: z.union([z.number(), z.string()]).optional(),
  lng: z.union([z.number(), z.string()]).optional(),
  employeeLongitude: z.union([z.number(), z.string()]).optional(),

  accuracy: z.union([z.number(), z.string()]).optional(),
  gps_accuracy: z.union([z.number(), z.string()]).optional(),

  heading: z.union([z.number(), z.string()]).optional(),
  speed: z.union([z.number(), z.string()]).optional(),
  address: z.string().optional(),
  device_info: z.string().optional(),
  deviceInfo: z.string().optional(),
});
