// ─── sal-nature-of-work.routes.ts ────────────────────────────────────────────
import { Router } from 'express';

import * as ctrl from './sal-nature-of-work.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     SalNatureOfWork:
 *       type: object
 *       required:
 *         - pk_nw_id
 *         - nature_of_work
 *       properties:
 *         pk_nw_id:
 *           type: integer
 *           description: Unique primary key ID for the nature of work record, automatically incremented.
 *           example: 1
 *         nature_of_work:
 *           type: string
 *           description: Descriptive name/identifier of the nature of work classification.
 *           example: "Contractual"
 *         date_timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp showing when this record was last updated.
 *           example: "2026-06-09T11:00:00.000Z"
 *         fk_user_id:
 *           type: integer
 *           description: The foreign key ID reference of the system administrator user who committed the change.
 *           example: 1
 *         last_status:
 *           type: string
 *           description: Audit state marker representing the creation or edit history status.
 *           example: "Added"
 *         username:
 *           type: string
 *           nullable: true
 *           description: Resolved username of the user who committed the record change, joined from the user registry.
 *           example: "admin"
 */

/**
 * @openapi
 * /api/master-salary/sal-nature-of-work:
 *   get:
 *     summary: Retrieve list of nature of work records
 *     description: Returns a complete list of nature of work entries registered in the database, with optional filters.
 *     tags:
 *       - Master Salary (Nature of Work)
 *     parameters:
 *       - in: query
 *         name: nature_of_work
 *         schema:
 *           type: string
 *         description: Filter by nature of work name prefix.
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by username of the modifying user.
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Filter by last status audit state.
 *     responses:
 *       200:
 *         description: List of nature of work entries returned successfully.
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
 *                   example: "Nature of Work list retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Nature of Work"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalNatureOfWork'
 *       400:
 *         description: Invalid query parameters.
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
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Nature of Work"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     details:
 *                       type: string
 *                       example: "Invalid query parameters"
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
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Nature of Work"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.get('/', ctrl.list);

/**
 * @openapi
 * /api/master-salary/sal-nature-of-work/{id}:
 *   get:
 *     summary: Retrieve a specific nature of work record by ID
 *     description: Returns detailed fields of a single registered nature of work record by its unique database primary key integer ID.
 *     tags:
 *       - Master Salary (Nature of Work)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target record.
 *     responses:
 *       200:
 *         description: Record returned successfully.
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
 *                   example: "Nature of Work record retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Nature of Work"
 *                 data:
 *                   $ref: '#/components/schemas/SalNatureOfWork'
 *       400:
 *         description: Invalid numeric ID format.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_ID"
 *                     details:
 *                       type: string
 *                       example: "ID must be a number."
 *       404:
 *         description: Record not found.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *                     details:
 *                       type: string
 *                       example: "Record not found."
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
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.get('/:id', ctrl.getById);

/**
 * @openapi
 * /api/master-salary/sal-nature-of-work:
 *   post:
 *     summary: Create a new nature of work record
 *     description: Registers a new custom nature of work. Validates uniqueness constraints.
 *     tags:
 *       - Master Salary (Nature of Work)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nature_of_work
 *               - fk_user_id
 *             properties:
 *               nature_of_work:
 *                 type: string
 *                 example: "Contractual"
 *               fk_user_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Created successfully.
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
 *                   example: "Nature of Work created successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Nature of Work"
 *                 data:
 *                   $ref: '#/components/schemas/SalNatureOfWork'
 *       400:
 *         description: Request payload validation failed.
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
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     details:
 *                       type: string
 *                       example: "Nature of work is required"
 *       409:
 *         description: Conflict. Nature of work name already exists.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "CONFLICT"
 *                     details:
 *                       type: string
 *                       example: "Contractual already exists."
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
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.post('/', ctrl.create);

/**
 * @openapi
 * /api/master-salary/sal-nature-of-work/{id}:
 *   put:
 *     summary: Update an existing nature of work record
 *     description: Updates properties of a specific nature of work.
 *     tags:
 *       - Master Salary (Nature of Work)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nature_of_work
 *               - fk_user_id
 *             properties:
 *               nature_of_work:
 *                 type: string
 *                 example: "Part-time"
 *               fk_user_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Updated successfully.
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
 *                   example: "Nature of Work updated successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Nature of Work"
 *                 data:
 *                   $ref: '#/components/schemas/SalNatureOfWork'
 *       400:
 *         description: Request payload validation failed or ID format is invalid.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_ID"
 *                     details:
 *                       type: string
 *                       example: "ID must be a number."
 *       404:
 *         description: Target record not found.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UPDATE_ERROR"
 *                     details:
 *                       type: string
 *                       example: "Record not found."
 *       409:
 *         description: Conflict. Nature of work name already exists.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "UPDATE_ERROR"
 *                     details:
 *                       type: string
 *                       example: "Part-time already exists."
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
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.put('/:id', ctrl.update);

/**
 * @openapi
 * /api/master-salary/sal-nature-of-work/{id}:
 *   delete:
 *     summary: Delete a nature of work record by ID
 *     description: Deletes the target nature of work.
 *     tags:
 *       - Master Salary (Nature of Work)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target record to delete.
 *     responses:
 *       200:
 *         description: Deleted successfully.
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
 *                   example: "Nature of Work deleted successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Nature of Work"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_nw_id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid numeric ID format.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_ID"
 *                     details:
 *                       type: string
 *                       example: "ID must be a number."
 *       404:
 *         description: Target record not found.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DELETE_ERROR"
 *                     details:
 *                       type: string
 *                       example: "Record not found."
 *       409:
 *         description: Deletion rejected. Either the record is application system-defined or linked to other database dependencies.
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
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DELETE_ERROR"
 *                     details:
 *                       type: string
 *                       example: "Selected record can't be deleted because it is related to other data."
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
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.delete('/:id', ctrl.remove);

export default router;
