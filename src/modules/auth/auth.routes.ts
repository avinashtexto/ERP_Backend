import { Router } from 'express';

import * as controller from './auth.controller.js';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User/Admin login
 *     description: Login with username, email, or mobile number and password. At least one of username, email, or mobile is required.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for login
 *               email:
 *                 type: string
 *                 description: Email address for login
 *               mobile:
 *                 type: string
 *                 description: Mobile number for login
 *               password:
 *                 type: string
 *                 description: Password (required)
 *               book_id:
 *                 type: integer
 *                 description: Book ID identifier for book-specific login
 *                 example: 1
 *           example:
 *             username: "admin"
 *             password: "secure_password"
 *             book_id: 1
 *
 *     responses:
 *       200:
 *         description: Login successful. Returns JWT access token, refresh token, role, and sanitized user/admin data.
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
 *             example:
 *               success: true
 *               message: "Login successful"
 *               timestamp: "2026-06-03 14:46:11"
 *               module: "Auth"
 *               data:
 *                 access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 role: "book"
 *                 user:
 *                   id: 1
 *                   username: "admin"
 *                   book_id: 1
 *                   book_name: "Lamor India Pvt Ltd"
 *                   database_name: "IIERPSystem"
 *       400:
 *         description: Invalid input - username/email/mobile and password required
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Success"
 *               timestamp: "2026-06-09 10:20:00"
 *               module: "Auth"
 *               error:
 *                 code: "INVALID_INPUT"
 *                 details:
 *                   message: "Username, email, or mobile is required"
 *                   acceptedFields:
 *                     login: "username | email | mobile (any one)"
 *                     password: "required"
 *                   validationErrors: []
 *       401:
 *         description: Unauthorized
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
 *                   example: "Username, email, or mobile and password are required"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "Auth"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_INPUT"
 *                     details:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: "Username, email, or mobile and password are required"
 *                         acceptedFields:
 *                           type: object
 *                           properties:
 *                             login:
 *                               type: string
 *                               example: "username | email | mobile (any one)"
 *                             password:
 *                               type: string
 *                               example: "required"
 *       404:
 *         description: Login Failed. User not found or incorrect credentials.
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
 *                   example: "Login Failed, Please try again"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "Auth"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *                     details:
 *                       type: string
 *                       example: "Login Failed, Please try again"
 *       500:
 *         description: Internal Server Error.
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
 *                   example: "Login error occurred"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:46:11"
 *                 module:
 *                   type: string
 *                   example: "Auth"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "LOGIN_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection timed out"
 */
router.post('/login', controller.login);

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh session tokens
 *     description: Returns a new access token using a valid refresh token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully.
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
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized. Token expired or invalid.
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
 *                       example: "UNAUTHORIZED"
 *                     details:
 *                       type: string
 *                       example: "Token Expired"
 *       500:
 *         description: Internal Server Error.
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
 *                       example: "REFRESH_TOKEN_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Token Expired"
 */
router.post('/refresh-token', controller.refreshToken);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log user out
 *     description: Invalidates the user's active session. Accepts an optional refresh token in the body to clear specific database sessions.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to be invalidated
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Logged out successfully.
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
 *                   example: "Logged out successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:48:00"
 *                 module:
 *                   type: string
 *                   example: "Auth"
 *       500:
 *         description: Internal Server Error.
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
 *                   example: "Logout failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:48:00"
 *                 module:
 *                   type: string
 *                   example: "Auth"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "LOGOUT_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.post('/logout', controller.logout);

/**
 * @openapi
 * /api/auth/health:
 *   get:
 *     summary: Retrieve health status for auth
 *     description: Checks if the authentication module and dependent services are operational.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Success. Auth module is healthy.
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
 *                   example: "Auth module is operational"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:49:00"
 *                 module:
 *                   type: string
 *                   example: "Auth"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "ok"
 */
router.get('/health', controller.health);

/**
 * @openapi
 * /api/auth/security-questions:
 *   get:
 *     summary: Get security questions
 *     description: Retrieves all available security questions for password recovery
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Security questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       question:
 *                         type: string
 */
router.get('/security-questions', controller.getSecurityQuestions);

/**
 * @openapi
 * /api/auth/employee-security-question:
 *   get:
 *     summary: Get employee security question
 *     description: Retrieves the security question for a specific employee by username
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee username
 *     responses:
 *       200:
 *         description: Security question retrieved successfully
 *       404:
 *         description: Employee not found
 */
router.get('/employee-security-question', controller.getEmployeeSecurityQuestion);

/**
 * @openapi
 * /api/auth/forgot-password/validate:
 *   post:
 *     summary: Validate forgot password credentials
 *     description: Validates username and security answer before allowing password reset
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - answer
 *             properties:
 *               username:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Credentials validated successfully
 *       400:
 *         description: Invalid credentials
 */
router.post('/forgot-password/validate', controller.validateForgotPassword);

/**
 * @openapi
 * /api/auth/forgot-password/reset:
 *   post:
 *     summary: Reset password
 *     description: Resets employee password after validating credentials
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - answer
 *               - new_password
 *             properties:
 *               username:
 *                 type: string
 *               answer:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid credentials or reset failed
 */
router.post('/forgot-password/reset', controller.resetPassword);

export default router;
