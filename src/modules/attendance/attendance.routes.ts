import { Router } from 'express';

import * as controller from './attendance.controller.js';

const router = Router();

/**
 * @openapi
 * /api/attendance/health:
 *   get:
 *     summary: Retrieve health status for attendance module
 *     tags:
 *       - Attendance
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server Error
 */
router.get('/health', controller.health);

/**
 * @openapi
 * /api/attendance/punch:
 *   post:
 *     summary: Record attendance punch (IN, OUT, Break, Resume)
 *     tags:
 *       - Attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empCode:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Check IN, Check OUT, Break, Resume]
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *               remark:
 *                 type: string
 *           example:
 *             empCode: "1"
 *             status: "Check IN"
 *             latitude: 19.0760
 *             longitude: 72.8777
 *             accuracy: 10
 *             remark: "Office check-in"
 *     responses:
 *       201:
 *         description: Punch recorded successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Check IN recorded successfully"
 *               data:
 *                 success: true
 *                 punch:
 *                   id: 1
 *                   payCode: "1"
 *                   empCode: "1"
 *                   empName: "admin"
 *                   atDate: "2026-06-02"
 *                   punchTime: "17:30:13"
 *                   punchDatetime: "2026-06-02T12:00:13.292Z"
 *                   device: "ReactNative"
 *                   punch: "Check IN"
 *                   manual: "N"
 *                   status: 1
 *                   latitude: "19.0760000"
 *                   longitude: "72.8777000"
 *                   address: "Mumbai, India"
 *                 location:
 *                   location_id: 1
 *                   location_name: "Main Office"
 *                   distance: "0.00m"
 *                   allowed: "50m"
 *                   withinRange: true
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Success"
 *               error:
 *                 code: "UNAUTHORIZED"
 *                 details: "Employee credentials not provided"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Out of range or missing employee link
 */
router.post('/punch', controller.punch);

/**
 * @openapi
 * /api/attendance/punch-in:
 *   post:
 *     summary: Record Check IN punch
 *     tags:
 *       - Attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empCode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *               remark:
 *                 type: string
 *     responses:
 *       201:
 *         description: Punch IN recorded successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Out of range or missing employee link
 */
router.post('/punch-in', controller.punch);

/**
 * @openapi
 * /api/attendance/punch-out:
 *   post:
 *     summary: Record Check OUT punch
 *     tags:
 *       - Attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empCode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *               remark:
 *                 type: string
 *     responses:
 *       201:
 *         description: Punch OUT recorded successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Out of range or missing employee link
 */
router.post('/punch-out', controller.checkout);

/**
 * @openapi
 * /api/attendance/checkout:
 *   post:
 *     summary: Record Checkout punch
 *     tags:
 *       - Attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empCode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *               remark:
 *                 type: string
 *     responses:
 *       201:
 *         description: Checkout recorded successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Out of range or missing employee link
 */
router.post('/checkout', controller.checkout);

/**
 * @openapi
 * /api/attendance/geofence:
 *   post:
 *     summary: Record geofenced check-in/out by employee id
 *     tags:
 *       - Attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - lat
 *               - lng
 *             properties:
 *               employeeId:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               status:
 *                 type: string
 *           example:
 *             employeeId: "1"
 *             lat: 19.0760
 *             lng: 72.8777
 *             status: "Check IN"
 *     responses:
 *       201:
 *         description: Geofence punch marked successfully
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Out of range
 */
router.post('/geofence', controller.markGeofenceAttendance);

/**
 * @openapi
 * /api/attendance/employee/{empCode}:
 *   get:
 *     summary: Retrieve historical punches for a specific employee
 *     tags:
 *       - Attendance
 *     parameters:
 *       - in: path
 *         name: empCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
router.get('/employee/:empCode', controller.getHistory);

/**
 * @openapi
 * /api/attendance/history:
 *   get:
 *     summary: Retrieve historical punches for the logged-in employee
 *     tags:
 *       - Attendance
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.get('/history', controller.getHistory);

/**
 * @openapi
 * /api/attendance/config:
 *   get:
 *     summary: Retrieve geofencing configuration and office settings
 *     tags:
 *       - Attendance
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server Error
 */
router.get('/config', controller.getAttendanceConfig);

/**
 * @openapi
 * /api/attendance/status:
 *   get:
 *     summary: Retrieve current punch status for the logged-in employee
 *     tags:
 *       - Attendance
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.get('/status', controller.getStatus);

/**
 * @openapi
 * /api/attendance/status/{empCode}:
 *   get:
 *     summary: Retrieve current punch status for a specific employee
 *     tags:
 *       - Attendance
 *     parameters:
 *       - in: path
 *         name: empCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
router.get('/status/:empCode', controller.getStatus);

/**
 * @openapi
 * /api/attendance/live-location:
 *   post:
 *     summary: Share and upload live coordinate ping
 *     tags:
 *       - Attendance
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
 *               accuracy:
 *                 type: number
 *               heading:
 *                 type: number
 *               speed:
 *                 type: number
 *               address:
 *                 type: string
 *               device_info:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coordinate logs recorded successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Employee profile not found
 */
router.post('/live-location', controller.postLiveLocation);

/**
 * @openapi
 * /api/attendance/live-location:
 *   get:
 *     summary: Retrieve current active coordinate locations of online employees
 *     tags:
 *       - Attendance
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or employee code
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server Error
 */
router.get('/live-location', controller.getLiveLocations);

/**
 * @openapi
 * /api/attendance/live-location/trail/{employeeId}:
 *   get:
 *     summary: Retrieve historical path coordinate logs for a specific employee
 *     tags:
 *       - Attendance
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: sinceSeconds
 *         schema:
 *           type: integer
 *           default: 900
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
router.get('/live-location/trail/:employeeId', controller.getEmployeeTrail);

export default router;
