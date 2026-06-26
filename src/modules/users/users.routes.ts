// ─────────────────────────────────────────────
//  users.routes.ts
//  All /users routes wired to controller handlers
// ─────────────────────────────────────────────

import { Router } from 'express';

import { authenticate } from '../../core/middlewares/auth.middleware.js';

import * as UserController from './users.controller.js';
import {
  createUserValidation,
  updateUserValidation,
  userFilterValidation,
  registerDeviceTokenValidation,
} from './users.dto.js';

const router = Router();

// Apply authentication middleware to all /api/users routes
router.use(authenticate);

// All user routes require authentication

/**
 * @openapi
 * /api/users/lookups/employees:
 *   get:
 *     summary: Retrieve employees list for user configuration lookup
 *     description: Returns a list of active employees including their ID, code, name, and date of joining.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employee
 *         schema:
 *           type: string
 *         description: Filter by employee name (prefix match)
 *       - in: query
 *         name: emp_code
 *         schema:
 *           type: string
 *         description: Filter by employee code (prefix match)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of employees retrieved successfully.
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
 *                   example: "Employees list retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pk_emp_id:
 *                         type: integer
 *                         example: 12
 *                       type:
 *                         type: string
 *                         example: "Staff"
 *                       emp_code:
 *                         type: string
 *                         example: "EMP001"
 *                       contact_name:
 *                         type: string
 *                         example: "John Doe"
 *                       doj:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-01T00:00:00.000Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 1
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 100
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "EMPLOYEES_FETCH_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.get('/lookups/employees', UserController.getEmployees);

/**
 * @openapi
 * /api/users/lookups/email-configurations:
 *   get:
 *     summary: Retrieve email configurations list for user config lookup
 *     description: Returns email configuration records mapping configured source email addresses.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of email configurations retrieved successfully.
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
 *                   example: "Email configurations retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pk_ec_id:
 *                         type: integer
 *                         example: 3
 *                       from_email:
 *                         type: string
 *                         format: email
 *                         example: "no-reply@tionix.com"
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "EMAIL_CONFIGS_FETCH_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.get('/lookups/email-configurations', UserController.getEmailConfigurations);

/**
 * @openapi
 * /api/users/lookups/security-questions:
 *   get:
 *     summary: Retrieve system security questions
 *     description: Returns all security questions configured for identity validation.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of security questions retrieved successfully.
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
 *                   example: "Security questions retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pk_question_id:
 *                         type: integer
 *                         example: 1
 *                       questions:
 *                         type: string
 *                         example: "What is your pet's name?"
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "SECURITY_QUESTIONS_FETCH_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.get('/lookups/security-questions', UserController.getSecurityQuestions);

/**
 * @openapi
 * /api/users/export:
 *   get:
 *     summary: Export filtered users list
 *     description: Returns a flat array of formatted user records ready for spreadsheet export.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by username (prefix match)
 *       - in: query
 *         name: employee
 *         schema:
 *           type: string
 *         description: Filter by employee name (prefix match)
 *       - in: query
 *         name: creator
 *         schema:
 *           type: string
 *         description: Filter by creator's username (prefix match)
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Filter by last modification status
 *       - in: query
 *         name: date_time_stamp
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by exact date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Users exported successfully.
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
 *                   example: "Users exported successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       "User ID":
 *                         type: integer
 *                         example: 1
 *                       "Username":
 *                         type: string
 *                         example: "john_doe"
 *                       "Employee":
 *                         type: string
 *                         example: "John Doe"
 *                       "Mobile":
 *                         type: string
 *                         example: "9876543210"
 *                       "Last Status":
 *                         type: string
 *                         example: "Active"
 *                       "Date/Time":
 *                         type: string
 *                         example: "11/6/2026, 2:46:11 PM"
 *                       "Created By":
 *                         type: string
 *                         example: "admin"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "USERS_EXPORT_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.get('/export', userFilterValidation, UserController.exportUsers);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Retrieve paginated users list
 *     description: Returns a list of users filtered by conditions with pagination parameters.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by username (prefix match)
 *       - in: query
 *         name: employee
 *         schema:
 *           type: string
 *         description: Filter by employee name (prefix match)
 *       - in: query
 *         name: creator
 *         schema:
 *           type: string
 *         description: Filter by creator's username (prefix match)
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Filter by last modification status
 *       - in: query
 *         name: date_time_stamp
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by exact modification date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Page size (items per page)
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
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
 *                   example: "Users retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pk_user_id:
 *                         type: integer
 *                         example: 1
 *                       fk_emp_id:
 *                         type: integer
 *                         nullable: true
 *                         example: 12
 *                       employee:
 *                         type: string
 *                         nullable: true
 *                         example: "John Doe"
 *                       username:
 *                         type: string
 *                         example: "john_doe"
 *                       mobile:
 *                         type: string
 *                         nullable: true
 *                         example: "9876543210"
 *                       fk_ec_id:
 *                         type: integer
 *                         nullable: true
 *                         example: 3
 *                       date_time_stamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-06-11T14:46:11.000Z"
 *                       fk_user_id:
 *                         type: integer
 *                         nullable: true
 *                         example: 1
 *                       last_status:
 *                         type: string
 *                         nullable: true
 *                         example: "Active"
 *                       answer:
 *                         type: string
 *                         nullable: true
 *                         example: "Fido"
 *                       creator:
 *                         type: string
 *                         nullable: true
 *                         example: "admin"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 50
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "USERS_FETCH_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.get('/', userFilterValidation, UserController.listUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve user by ID
 *     description: Returns the user object matching the given user ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (integer)
 *     responses:
 *       200:
 *         description: User retrieved successfully.
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
 *                   example: "User retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_user_id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *                     fk_emp_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 12
 *                     fk_ec_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 3
 *                     mobile:
 *                       type: string
 *                       nullable: true
 *                       example: "9876543210"
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       404:
 *         description: User not found.
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
 *                   example: "User not found."
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *                     details:
 *                       type: string
 *                       example: "User not found."
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "USER_GET_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.get('/:id', UserController.getUser);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user record validating constraints. Username and password are required. Mobile and email configuration are optional (for employees).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - answer
 *               - security_question_id
 *             properties:
 *               username:
 *                 type: string
 *                 maxLength: 15
 *                 example: "newuser"
 *               password:
 *                 type: string
 *                 maxLength: 10
 *                 example: "pass123"
 *               mobile:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: "1234567890"
 *               fk_ec_id:
 *                 type: integer
 *                 nullable: true
 *                 description: Email configuration ID
 *                 example: 1
 *               fk_emp_id:
 *                 type: integer
 *                 nullable: true
 *                 description: Employee ID
 *                 example: 12
 *               answer:
 *                 type: string
 *                 maxLength: 50
 *                 example: "fluffy"
 *               security_question_id:
 *                 type: integer
 *                 description: Security question ID
 *                 example: 1

 *     responses:
 *       201:
 *         description: User created successfully.
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
 *                   example: "newuser is saved."
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_user_id:
 *                       type: integer
 *                       example: 2
 *                     username:
 *                       type: string
 *                       example: "newuser"
 *                     fk_emp_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 12
 *                     fk_ec_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 3
 *                     mobile:
 *                       type: string
 *                       nullable: true
 *                       example: "9876543210"
 *       400:
 *         description: Bad Request. Validation failed.
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
 *                   example: "Validation failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_INPUT"
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           msg:
 *                             type: string
 *                             example: "Username is required."
 *                           param:
 *                             type: string
 *                             example: "username"
 *                           location:
 *                             type: string
 *                             example: "body"
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       409:
 *         description: Username already exists.
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
 *                   example: "newuser already exists."
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "ALREADY_EXISTS"
 *                     details:
 *                       type: string
 *                       example: "newuser already exists."
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "USER_CREATE_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.post('/', createUserValidation, UserController.createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     description: Modifies user configuration properties.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (integer)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 maxLength: 15
 *                 example: "updateduser"
 *               password:
 *                 type: string
 *                 maxLength: 10
 *                 example: "newpass1"
 *               confirm_password:
 *                 type: string
 *                 maxLength: 10
 *                 example: "newpass1"
 *               fk_emp_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 12
 *               fk_ec_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *               answer:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: "Fido"
 *               mobile:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: "9876543210"
 *               security_question_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 1

 *     responses:
 *       200:
 *         description: User updated successfully.
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
 *                   example: "updateduser is saved."
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_user_id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "updateduser"
 *                     fk_emp_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 12
 *                     fk_ec_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 3
 *                     mobile:
 *                       type: string
 *                       nullable: true
 *                       example: "9876543210"
 *       400:
 *         description: Bad Request. Validation failed.
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
 *                   example: "Validation failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_INPUT"
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           msg:
 *                             type: string
 *                             example: "Username cannot be empty."
 *                           param:
 *                             type: string
 *                             example: "username"
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       403:
 *         description: Forbidden. Action not allowed on system-defined users.
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
 *                   example: "You can't change system defined user details."
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "FORBIDDEN"
 *                     details:
 *                       type: string
 *                       example: "You can't change system defined user details."
 *       409:
 *         description: Username already exists on another user.
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
 *                   example: "updateduser already exists."
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "ALREADY_EXISTS"
 *                     details:
 *                       type: string
 *                       example: "updateduser already exists."
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "USER_UPDATE_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.put('/:id', updateUserValidation, UserController.updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes the user matching the given ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (integer)
 *     responses:
 *       200:
 *         description: User deleted successfully.
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
 *                   example: "User is deleted."
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
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
 *                   example: "Unauthorized access"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Invalid bearer token"
 *       500:
 *         description: Internal server error or user is system defined/related to other data and cannot be deleted.
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
 *                   example: "You can't delete system defined user details."
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "users"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DELETE_FAILED"
 *                     details:
 *                       type: string
 *                       example: "You can't delete system defined user details."
 */
router.post('/device-token', registerDeviceTokenValidation, UserController.registerDeviceToken);
router.delete('/:id', UserController.deleteUser);

export default router;
