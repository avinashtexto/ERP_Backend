import { Router } from 'express';

import * as controller from './user-rights.controller.js';

const router = Router();

/**
 * @openapi
 * /api/user-rights/health:
 *   get:
 *     summary: Retrieve health status for the User Rights module
 *     description: Returns a simple operational status of the service without executing database operations.
 *     tags:
 *       - User Rights
 *     responses:
 *       200:
 *         description: Service is healthy and operating normally.
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
 *                   example: "Health check successful"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-02 17:25:38"
 *                 module:
 *                   type: string
 *                   example: "CMS"
 *                 data:
 *                   type: string
 *                   example: "ok"
 *       500:
 *         description: Internal Server Error.
 */
router.get('/health', controller.health);

/**
 * @openapi
 * /api/user-rights/users:
 *   get:
 *     summary: Retrieve a list of all active users
 *     description: Returns basic identifiers and metadata for all application users ordered by their username.
 *     tags:
 *       - User Rights
 *     responses:
 *       200:
 *         description: List of users retrieved successfully.
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
 *                   example: "2026-06-02 17:25:38"
 *                 module:
 *                   type: string
 *                   example: "CMS"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pk_user_id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: "admin"
 *       500:
 *         description: Internal Server Error.
 */
/**
 * @openapi
 * /api/admin/user-rights/get_my_user_right:
 *   get:
 *     summary: Retrieve rights configuration for the currently logged in user
 *     description: Fetches full privileges categorised into masters, transactions, reports, and others, including related processes, dashboards, and branch boundaries for the logged in user context.
 *     tags:
 *       - User Rights
 *     responses:
 *       200:
 *         description: Privileges loaded successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/get_my_user_right', controller.getMyUserRights);

router.get('/users', controller.listUsers);

/**
 * @openapi
 * /api/user-rights/users/{id}/rights:
 *   get:
 *     summary: Retrieve comprehensive rights for a specific user
 *     description: Fetches full privileges categorised into masters, transactions, reports, and others, including related processes, dashboards, and branch boundaries.
 *     tags:
 *       - User Rights
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique integer ID of the target user
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Privileges loaded successfully.
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
 *                   example: "User rights retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-02 17:25:38"
 *                 module:
 *                   type: string
 *                   example: "CMS"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         pk_user_id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         own_records:
 *                           type: boolean
 *                         other_records:
 *                           type: boolean
 *                     masters:
 *                       type: array
 *                       items:
 *                         type: object
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     reports:
 *                       type: array
 *                       items:
 *                         type: object
 *                     others:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/users/:id/rights', controller.getUserRights);

/**
 * @openapi
 * /api/user-rights/users/rights:
 *   post:
 *     summary: Save complete rights configuration for a user
 *     description: Overwrites active user privileges across masters, transactions, reports, others, branches, specials, dashboards, and processes inside a secure transaction.
 *     tags:
 *       - User Rights
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - operator_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user getting updated
 *                 example: 1
 *               operator_id:
 *                 type: integer
 *                 description: ID of the operator committing the change
 *                 example: 1
 *               own_records:
 *                 type: boolean
 *                 example: true
 *               other_records:
 *                 type: boolean
 *                 example: false
 *               masters:
 *                 type: array
 *                 items:
 *                   type: object
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: object
 *               reports:
 *                 type: array
 *                 items:
 *                   type: object
 *               others:
 *                 type: array
 *                 items:
 *                   type: object
 *               specials:
 *                 type: array
 *                 items:
 *                   type: object
 *               branches:
 *                 type: array
 *                 items:
 *                   type: object
 *               dashboards:
 *                 type: array
 *                 items:
 *                   type: object
 *               processes:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Privileges updated successfully.
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
 *                   example: "User rights updated successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-02 17:25:38"
 *                 module:
 *                   type: string
 *                   example: "CMS"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Validation failed or invalid form name provided.
 *       404:
 *         description: Target user not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/users/rights', controller.saveUserRights);

/**
 * @openapi
 * /api/user-rights/forms:
 *   post:
 *     summary: Create a new form registration
 *     description: Inserts a new form definition record in the `new_id` table.
 *     tags:
 *       - User Rights
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - form_name
 *             properties:
 *               form_name:
 *                 type: string
 *                 description: Unique string identification for the form
 *                 maxLength: 100
 *                 example: "new_form"
 *               prefix:
 *                 type: string
 *                 maxLength: 5
 *                 example: "NF"
 *               last_id:
 *                 type: string
 *                 example: "0"
 *               start_with:
 *                 type: string
 *                 example: "1"
 *               len:
 *                 type: string
 *                 example: "10"
 *               module_name:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Sales"
 *               module_caption:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Sales Module"
 *               module_id:
 *                 type: number
 *                 example: 2
 *               form_id:
 *                 type: number
 *                 example: 201
 *               news:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Form created successfully.
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
 *                   example: "Form 'new_form' registered successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Validation failed.
 *       409:
 *         description: Form name already exists.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/forms', controller.createNewForm);

export default router;
