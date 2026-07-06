import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

import * as attendanceController from '../attendance/attendance.controller.js';
import * as authController from '../auth/auth.controller.js';
import * as leaveRequestController from '../leave-request/leave-request.controller.js';
import * as loanRequestController from '../loan-request/loan-request.controller.js';
import * as usersController from '../users/users.controller.js';
import * as personalWorkController from '../personal-work/personal-work.controller.js';
import * as salShiftTimingController from '../sal-shift-timing/sal-shift-timing.controller.js';
import * as salCompEmployeesController from '../sal-comp-employees/sal-comp-employees.controller.js';

import { authenticate } from '@/core/middlewares/auth.middleware.js';
import { db } from '@/config/db.config.js';
import { hr_notification } from '@/shared/database/schemas/index.js';
import { desc, eq } from 'drizzle-orm';

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.resolve(process.cwd(), 'public/uploads/profile');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

const leaveStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.resolve(process.cwd(), 'public/uploads/leaves');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `leave_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  }
});

const leaveUpload = multer({ storage: leaveStorage });

/**
 * Mobile API Router
 * All mobile-specific endpoints are prefixed with /mobile
 * 
 * Authentication:
 * - Public endpoints (no auth required): POST /auth/login, POST /auth/logout, GET /auth/health
 * - Protected endpoints (require Bearer token): All other endpoints
 * 
 * Routes:
 * POST   /mobile/auth/login          - Mobile login (includes refresh token) [PUBLIC]
 * POST   /mobile/auth/logout         - Logout [PUBLIC]
 * GET    /mobile/auth/health         - Health check [PUBLIC]
 * 
 * POST   /mobile/attendance/punch-in      - Check IN [PROTECTED]
 * POST   /mobile/attendance/checkout      - Check OUT [PROTECTED]
 * GET    /mobile/attendance/history        - Attendance history [PROTECTED]
 * GET    /mobile/attendance/config         - Attendance config [PROTECTED]
 * GET    /mobile/attendance/status/:empCode - Attendance status [PROTECTED]
 * POST   /mobile/attendance/live-location  - Live location ping [PROTECTED]
 * GET    /mobile/attendance/live-location/config - Live location config [PROTECTED]
 * 
 * GET    /mobile/leave-requests/balance    - Get leave balance [PROTECTED]
 * GET    /mobile/leave-requests/employees    - Get employees dropdown [PROTECTED]
 * GET    /mobile/leave-requests/leave-types  - Get leave types [PROTECTED]
 * GET    /mobile/leave-requests              - List leave requests [PROTECTED]
 * POST   /mobile/leave-requests              - Create leave request [PROTECTED]
 * GET    /mobile/leave-requests/:id          - Get single request [PROTECTED]
 * PUT    /mobile/leave-requests/:id          - Update request [PROTECTED]
 * DELETE /mobile/leave-requests/:id          - Delete request [PROTECTED]
 * POST   /mobile/leave-requests/:id/authorize - Authorize request [PROTECTED]
 * 
 * GET    /mobile/loan-requests/employees    - Get employees dropdown [PROTECTED]
 * POST   /mobile/loan-requests/calculate     - Calculate EMI [PROTECTED]
 * GET    /mobile/loan-requests              - List loan requests [PROTECTED]
 * POST   /mobile/loan-requests              - Create loan request [PROTECTED]
 * GET    /mobile/loan-requests/:id          - Get single request [PROTECTED]
 * PUT    /mobile/loan-requests/:id          - Update request [PROTECTED]
 * DELETE /mobile/loan-requests/:id          - Delete request [PROTECTED]
 * POST   /mobile/loan-requests/:id/authorize - Authorize request [PROTECTED]
 * 
 * GET    /mobile/personal-work              - List personal work requests [PROTECTED]
 * POST   /mobile/personal-work              - Create personal work request [PROTECTED]
 * GET    /mobile/personal-work/:id          - Get single request [PROTECTED]
 * POST   /mobile/personal-work/:id/authorize - Authorize request [PROTECTED]
 * DELETE /mobile/personal-work/:id          - Delete request [PROTECTED]
 */

const router = Router();

// ── Auth Routes ────────────────────────────────────────────────
/**
 * @openapi
 * /api/mobile/auth/login:
 *   post:
 *     summary: Mobile login
 *     description: >
 *       Login with username and password. The `username` field accepts a
 *       username, email address, or mobile number — the backend automatically
 *       resolves which one was provided. The mobile app always sends the login
 *       identifier in the `username` field.
 *     tags:
 *       - Mobile
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username, email, or mobile number for login
 *               password:
 *                 type: string
 *                 description: Password
 *           examples:
 *             username:
 *               summary: Login with username
 *               value:
 *                 username: "Avinash"
 *                 password: "secret123"
 *             email:
 *               summary: Login with email (sent in username field)
 *               value:
 *                 username: "avinash@example.com"
 *                 password: "secret123"
 *             mobile:
 *               summary: Login with mobile (sent in username field)
 *               value:
 *                 username: "7058700755"
 *                 password: "secret123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 timestamp:
 *                   type: string
 *                   example: 2026-06-09 10:20:00
 *                 module:
 *                   type: string
 *                   example: Auth
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: JWT access token
 *                     refresh_token:
 *                       type: string
 *                       description: JWT refresh token
 *                     role:
 *                       type: string
 *                       enum: [admin, sal_employee, book]
 *                       description: User role
 *                     user:
 *                       type: object
 *                       description: User details
 *                       properties:
 *                         pk_user_id:
 *                           type: integer
 *                           description: User ID
 *                         username:
 *                           type: string
 *                           description: Username
 *                         email:
 *                           type: string
 *                           description: Email address
 *                         mobile:
 *                           type: string
 *                           description: Mobile number
 *                         fk_emp_id:
 *                           type: number
 *                           description: Employee ID
 *       400:
 *         description: Invalid input - username/email/mobile and password required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Success
 *                 timestamp:
 *                   type: string
 *                 module:
 *                   type: string
 *                   example: Auth
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: INVALID_INPUT
 *                     details:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: Username, email, or mobile is required
 *                         acceptedFields:
 *                           type: object
 *                           properties:
 *                             login:
 *                               type: string
 *                               example: username | email | mobile (any one)
 *                             password:
 *                               type: string
 *                               example: required
 *                         validationErrors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               path:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               message:
 *                                 type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Login Failed, Please try again
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: UNAUTHORIZED
 *                     details:
 *                       type: string
 *                       example: Login Failed, Please try again
 */
router.post('/auth/login', authController.login);

/**
 * @openapi
 * /api/mobile/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Logout the current user and invalidate their refresh token.
 *     tags:
 *       - Mobile
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to invalidate (optional)
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Logged out successfully"
 *               timestamp: "2026-06-09 10:20:00"
 *               module: "Auth"
 */
router.post('/auth/logout', authController.logout);

/**
 * @openapi
 * /api/mobile/auth/health:
 *   get:
 *     summary: Health check
 *     description: Check if the auth module is operational.
 *     tags:
 *       - Mobile
 *     security: []
 *     responses:
 *       200:
 *         description: Auth module is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Auth module is operational
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 */
router.get('/auth/health', authController.health);

// ── Attendance Routes ──────────────────────────────────────────
/**
 * @openapi
 * /api/mobile/attendance/punch-in:
 *   post:
 *     summary: Check IN
 *     description: >
 *       Mark Check IN attendance. Geofence validation is based on employee's geolocation setting in sal_employee table:
 *       - If geolocation=true: Must be within 25m radius of office
 *       - If geolocation=false/null: Can punch from anywhere
 *     tags:
 *       - Mobile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empCode:
 *                 type: string
 *                 description: Employee code
 *               latitude:
 *                 type: number
 *                 description: Employee latitude
 *               longitude:
 *                 type: number
 *                 description: Employee longitude
 *     responses:
 *       201:
 *         description: Punch recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Check IN recorded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     punch:
 *                       type: object
 *                       description: Punch record details
 *                     location:
 *                       type: object
 *                       properties:
 *                         location_id:
 *                           type: number
 *                         location_name:
 *                           type: string
 *                         distance:
 *                           type: string
 *                         allowed:
 *                           type: string
 *                         withinRange:
 *                           type: boolean
 *                     geolocationRequired:
 *                       type: boolean
 *                       description: Whether geofence is enforced for this employee
 *                     geofenceEnforced:
 *                       type: boolean
 *       403:
 *         description: Out of geofence range (only if geolocationRequired=true)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: OUT_OF_RANGE
 *                     details:
 *                       type: object
 *                       properties:
 *                         distance:
 *                           type: string
 *                         allowed:
 *                           type: string
 */
router.post('/attendance/punch-in', authenticate, attendanceController.punch);

/**
 * @openapi
 * /api/mobile/attendance/checkout:
 *   post:
 *     summary: Check OUT
 *     description: >
 *       Mark Check OUT attendance. Geofence validation is based on employee's geolocation setting in sal_employee table:
 *       - If geolocation=true: Must be within 25m radius of office
 *       - If geolocation=false/null: Can punch from anywhere
 *       Note: Check OUT bypasses geofence check if employee has already checked in
 *     tags:
 *       - Mobile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empCode:
 *                 type: string
 *                 description: Employee code
 *               latitude:
 *                 type: number
 *                 description: Employee latitude
 *               longitude:
 *                 type: number
 *                 description: Employee longitude
 *               accuracy:
 *                 type: number
 *                 description: GPS accuracy in meters
 *               remark:
 *                 type: string
 *                 description: Address or remark
 *     responses:
 *       201:
 *         description: Checkout recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Check OUT recorded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     punch:
 *                       type: object
 *                       description: Punch record details
 *                     location:
 *                       type: object
 *                       properties:
 *                         location_id:
 *                           type: number
 *                         location_name:
 *                           type: string
 *                         distance:
 *                           type: string
 *                         allowed:
 *                           type: string
 *                         withinRange:
 *                           type: boolean
 *                     geolocationRequired:
 *                       type: boolean
 *                       description: Whether geofence is enforced for this employee
 *                     geofenceEnforced:
 *                       type: boolean
 */
router.post('/attendance/checkout', authenticate, attendanceController.checkout);

/**
 * @openapi
 * /api/mobile/attendance/history:
 *   get:
 *     summary: Attendance history
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: History retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attendance history retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         example: "2026-06-09"
 *                       totalWork:
 *                         type: string
 *                         example: "08h 30m"
 *                       records:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             empCode:
 *                               type: string
 *                             empName:
 *                               type: string
 *                             atDate:
 *                               type: string
 *                             punchTime:
 *                               type: string
 *                             punchDatetime:
 *                               type: string
 *                             device:
 *                               type: string
 *                             punch:
 *                               type: string
 *                             manual:
 *                               type: string
 *                             status:
 *                               type: integer
 *                             latitude:
 *                               type: string
 *                             longitude:
 *                               type: string
 *                             address:
 *                               type: string
 */
router.get('/attendance/history', authenticate, attendanceController.getHistory);
router.get('/attendance/report', authenticate, attendanceController.getAttendanceReport);

/**
 * @openapi
 * /api/mobile/attendance/config:
 *   get:
 *     summary: Attendance config
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: Config retrieved
 */
router.get('/attendance/config', authenticate, attendanceController.getAttendanceConfig);

/**
 * @openapi
 * /api/mobile/attendance/status/{empCode}:
 *   get:
 *     summary: Attendance status
 *     description: >
 *       Retrieve today's punch status for an employee. Resolves employee by:
 *       1. Numeric fk_emp_id (e.g. "1")
 *       2. Numeric pk_user_id
 *       3. Username (case-insensitive, e.g. "Rahul")
 *       4. sal_employee emp_code (e.g. "EMP001")
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: path
 *         name: empCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee identifier - can be numeric ID, username, or emp_code (e.g. EMP001)
 *         example: "1"
 *     responses:
 *       200:
 *         description: Status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "Check IN"
 *                     lastPunchTime:
 *                       type: string
 *                       nullable: true
 *                     lastAddress:
 *                       type: string
 *                       nullable: true
 *                     empCode:
 *                       type: string
 *                     nextSuggestedPunch:
 *                       type: string
 *                       example: "Check OUT"
 *       400:
 *         description: Missing employee identifier
 *       403:
 *         description: Employee not found
 */
router.get('/attendance/status/:empCode', authenticate, attendanceController.getStatus);

/**
 * @openapi
 * /api/mobile/attendance/employee/{id}:
 *   get:
 *     summary: Get employee profile
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved
 */
router.get('/attendance/employee/:id', authenticate, usersController.getEmployeeProfile);

/**
 * @openapi
 * /api/mobile/attendance/employee/{id}:
 *   put:
 *     summary: Update employee profile
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/attendance/employee/:id', authenticate, usersController.updateEmployeeProfile);

/**
 * @openapi
 * /api/mobile/attendance/profile/image:
 *   post:
 *     summary: Upload profile image
 *     tags:
 *       - Mobile
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 */
router.post(
  '/attendance/profile/image',
  authenticate,
  upload.single('profileImage'),
  usersController.uploadProfileImage,
);

/**
 * @openapi
 * /api/mobile/attendance/live-location:
 *   post:
 *     summary: Live location ping
 *     tags:
 *       - Mobile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Location recorded
 */
router.post('/attendance/live-location', authenticate, attendanceController.postLiveLocation);

/**
 * @openapi
 * /api/mobile/attendance/live-location/config:
 *   get:
 *     summary: Live location config
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: Config retrieved
 */
router.get(
  '/attendance/live-location/config',
  authenticate,
  attendanceController.getAttendanceConfig,
);

/**
 * @openapi
 * /api/mobile/hrm/admin/hl-geolocations:
 *   get:
 *     summary: Get all geolocations
 *     description: Retrieve all office geolocation configurations
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: Geolocations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Geolocations retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     geolocations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           pkGeoId:
 *                             type: integer
 *                           OfficeName:
 *                             type: string
 *                           fkHLId:
 *                             type: integer
 *                           Latitude:
 *                             type: number
 *                           Longitude:
 *                             type: number
 *                           RadiusMeters:
 *                             type: integer
 *                           IsActive:
 *                             type: boolean
 *                           CreatedAt:
 *                             type: string
 *                           officeName:
 *                             type: string
 */
router.get('/hrm/admin/hl-geolocations', authenticate, attendanceController.getGeolocations);

// ── Leave Request Routes ────────────────────────────────────────
/**
 * @openapi
 * /api/mobile/leave-requests/balance:
 *   get:
 *     summary: Get leave balance
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: query
 *         name: fk_emp_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from_date
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: to_date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Balance retrieved
 */
router.get('/leave-requests/balance', authenticate, leaveRequestController.getLeaveBalance);

/**
 * @openapi
 * /api/mobile/leave-requests/employees:
 *   get:
 *     summary: Get employees dropdown
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: Employees retrieved
 */
router.get('/leave-requests/employees', authenticate, leaveRequestController.getEmployees);

/**
 * @openapi
 * /api/mobile/leave-requests/leave-types:
 *   get:
 *     summary: Get leave types
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: Leave types retrieved
 */
router.get('/leave-requests/leave-types', authenticate, leaveRequestController.getLeaveTypes);

/**
 * @openapi
 * /api/mobile/leave-requests:
 *   get:
 *     summary: List leave requests
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: List retrieved
 */
router.get('/leave-requests', authenticate, leaveRequestController.listLeaveRequests);
router.get('/leave-requests/report', authenticate, leaveRequestController.getLeaveReport);
router.get('/leave-requests/:id/report', authenticate, leaveRequestController.getLeaveReportById);

/**
 * @openapi
 * /api/mobile/leave-requests:
 *   post:
 *     summary: Create leave request
 *     tags:
 *       - Mobile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Request created
 */
router.post('/leave-requests', authenticate, leaveRequestController.createLeaveRequest);
router.post(
  '/leave-requests/upload',
  authenticate,
  leaveUpload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const relativePath = `/uploads/leaves/${req.file.filename}`;
    return res.status(200).json({ success: true, data: { path: relativePath } });
  }
);

/**
 * @openapi
 * /api/mobile/leave-requests/{id}:
 *   get:
 *     summary: Get single request
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request retrieved
 */
router.get('/leave-requests/:id', authenticate, leaveRequestController.getLeaveRequest);

/**
 * @openapi
 * /api/mobile/leave-requests/{id}:
 *   put:
 *     summary: Update request
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request updated
 */
router.put('/leave-requests/:id', authenticate, leaveRequestController.updateLeaveRequest);

/**
 * @openapi
 * /api/mobile/leave-requests/{id}:
 *   delete:
 *     summary: Delete request
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request deleted
 */
router.delete('/leave-requests/:id', authenticate, leaveRequestController.deleteLeaveRequest);
router.post('/leave-requests/:id/cancel', authenticate, leaveRequestController.cancelLeaveRequest);

/**
 * @openapi
 * /api/mobile/leave-requests/{id}/authorize:
 *   post:
 *     summary: Authorize request
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request authorized
 */
router.post(
  '/leave-requests/:id/authorize',
  authenticate,
  leaveRequestController.authorizeLeaveRequest,
);

// ── Loan Request Routes ─────────────────────────────────────────
router.get('/loan-requests/employees', authenticate, loanRequestController.getEmployees);
router.post('/loan-requests/calculate', authenticate, loanRequestController.calculateEMI);
router.get('/loan-requests', authenticate, loanRequestController.listLoans);
router.get('/loan-requests/report', authenticate, loanRequestController.getLoanReport);
router.get('/loan-requests/:id/report', authenticate, loanRequestController.getLoanReportById);
router.post('/loan-requests', authenticate, loanRequestController.createLoan);
router.get('/loan-requests/:id', authenticate, loanRequestController.getLoan);
router.put('/loan-requests/:id', authenticate, loanRequestController.updateLoan);
router.delete('/loan-requests/:id', authenticate, loanRequestController.deleteLoan);
router.post('/loan-requests/:id/authorize', authenticate, loanRequestController.authorizeLoan);

// ── Personal Work Routes ───────────────────────────────────────
router.get('/personal-work/shift-end', authenticate, personalWorkController.getShiftEndTimeForEmployee);
router.get('/personal-work', authenticate, personalWorkController.listRequests);
router.post('/personal-work', authenticate, personalWorkController.createRequest);
router.get('/personal-work/:id', authenticate, personalWorkController.getRequest);
router.put('/personal-work/:id', authenticate, personalWorkController.updateRequest);
router.post('/personal-work/:id/authorize', authenticate, personalWorkController.authorizeRequest);
router.delete('/personal-work/:id', authenticate, personalWorkController.deleteRequest);


// ── ERP Shift Timing Routes ───────────────────────────────────
/**
 * @openapi
 * /api/mobile/shift-timing:
 *   get:
 *     summary: Get all shift timings
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: Shift timings retrieved
 */
router.get('/shift-timing', authenticate, salShiftTimingController.getAll);

/**
 * @openapi
 * /api/mobile/shift-timing/{id}:
 *   get:
 *     summary: Get shift timing by ID
 *     tags:
 *       - Mobile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shift timing retrieved
 */
router.get('/shift-timing/:id', authenticate, salShiftTimingController.getById);

/**
 * @openapi
 * /api/mobile/notifications:
 *   get:
 *     summary: Retrieve real-time notifications for the logged in user
 *     tags:
 *       - Mobile
 *     responses:
 *       200:
 *         description: Notification array successfully retrieved
 */
router.get('/notifications', authenticate, async (req: any, res: any) => {
  try {
    const userId = req.user?.pk_user_id || req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in session token' });
    }

    const rows = await db
      .select()
      .from(hr_notification)
      .where(eq(hr_notification.fk_user_id, Number(userId)))
      .orderBy(desc(hr_notification.not_date));

    const formattedData = rows.map((r) => {
      // Parse relative time or format it nicely
      const diffMs = Date.now() - new Date(r.not_date).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let relativeTime = 'Just now';
      if (diffMins >= 60) {
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs >= 24) {
          const diffDays = Math.floor(diffHrs / 24);
          relativeTime = `${diffDays}d ago`;
        } else {
          relativeTime = `${diffHrs}h ago`;
        }
      } else if (diffMins > 0) {
        relativeTime = `${diffMins}m ago`;
      }

      return {
        id: String(r.pk_notif_id),
        title: r.form_name,
        message: r.announcement || '',
        time: relativeTime,
        read: !r.authorize, // Mock read status based on auth or default
        type: r.form_name === 'Announcement and Notice' ? 'system' : 'leave',
      };
    });

    return res.status(200).json({
      ok: true,
      data: formattedData,
    });
  } catch (err: any) {
    console.error('Failed to fetch mobile notifications:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Complaint Employees Endpoints
router.get('/sal-comp-employees', authenticate, salCompEmployeesController.getAll);
router.get('/sal-comp-employees/:id', authenticate, salCompEmployeesController.getById);
router.post('/sal-comp-employees', authenticate, salCompEmployeesController.create);
router.put('/sal-comp-employees/:id', authenticate, salCompEmployeesController.update);
router.delete('/sal-comp-employees/:id', authenticate, salCompEmployeesController.remove);

export default router;


