import { pgTable, varchar, integer, timestamp, numeric, boolean, text } from 'drizzle-orm/pg-core';

export const attendanceTable = pgTable('attendance', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  payCode: varchar('pay_code', { length: 50 }),
  empCode: varchar('emp_code', { length: 50 }).notNull(),
  empName: varchar('emp_name', { length: 100 }),
  atDate: varchar('at_date', { length: 20 }).notNull(), // stored as YYYY-MM-DD
  punchTime: varchar('punch_time', { length: 20 }), // stored as HH:MM:SS
  punchDatetime: timestamp('punch_datetime').defaultNow().notNull(),
  device: varchar('device', { length: 50 }).default('ReactNative'),
  punch: varchar('punch', { length: 20 }), // e.g. 'Check IN', 'Check OUT', 'Break', 'Resume'
  manual: varchar('manual', { length: 1 }).default('N'),
  status: integer('status').default(1),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  address: text('address'),
});

export const attendanceLocationsTable = pgTable('attendance_locations', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  locationName: varchar('location_name', { length: 100 }).notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: numeric('longitude', { precision: 10, scale: 7 }).notNull(),
  address: text('address'),
  allowedRadius: numeric('allowed_radius', { precision: 10, scale: 2 }).default('25.00'),
  locationType: varchar('location_type', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  fkHLId: integer('fk_hl_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const gpsAttendanceLogsTable = pgTable('gps_attendance_logs', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  employeeId: varchar('employee_id', { length: 50 }).notNull(),
  attendanceType: varchar('attendance_type', { length: 20 }).notNull(), // e.g. 'LIVE_TRACKING', 'GEOFENCE'
  attendanceDate: varchar('attendance_date', { length: 20 }).notNull(), // YYYY-MM-DD
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  employeeLatitude: numeric('employee_latitude', { precision: 10, scale: 7 }).notNull(),
  employeeLongitude: numeric('employee_longitude', { precision: 10, scale: 7 }).notNull(),
  employeeAddress: text('employee_address'),
  officeLatitude: numeric('office_latitude', { precision: 10, scale: 7 }).notNull(),
  officeLongitude: numeric('office_longitude', { precision: 10, scale: 7 }).notNull(),
  distanceMeters: numeric('distance_meters', { precision: 10, scale: 2 }).notNull(),
  allowedRadiusMeters: numeric('allowed_radius_meters', { precision: 10, scale: 2 }).notNull(),
  attendanceStatus: varchar('attendance_status', { length: 20 }).notNull(), // e.g. 'approved', 'rejected'
});
