// ─── sal-it-section.routes.ts ───────────────────────────────────────────────
import { Router } from 'express';

import * as controller from './sal-it-section.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     SalItSection:
 *       type: object
 *       required:
 *         - pk_sec_id
 *         - it_section
 *         - additraction
 *         - fk_user_id
 *       properties:
 *         pk_sec_id:
 *           type: integer
 *           description: Unique primary key ID for the Income Tax section, automatically incremented.
 *           example: 1
 *         it_section:
 *           type: string
 *           description: Income Tax Section name (length 1-75 characters).
 *           example: "Section 80C"
 *         deduction:
 *           type: string
 *           nullable: true
 *           description: Deduction amount decimal value.
 *           example: "150000.00"
 *         fk_fy_id:
 *           type: integer
 *           nullable: true
 *           description: Financial year lookup ID reference.
 *           example: 2
 *         date_timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp showing when this record was last updated.
 *           example: "2026-06-09T11:00:00.000Z"
 *         fk_user_id:
 *           type: integer
 *           nullable: true
 *           description: Modifying user ID.
 *           example: 1
 *         last_status:
 *           type: string
 *           nullable: true
 *           description: Audit state history status.
 *           example: "Added"
 *         additraction:
 *           type: string
 *           description: Dropdown status addition/subtraction mode.
 *           enum: [Addition, Subtraction]
 *           example: "Subtraction"
 *         username:
 *           type: string
 *           nullable: true
 *           description: Creator username.
 *           example: "admin"
 */

/**
 * @openapi
 * /api/master-salary/sal-it-section:
 *   get:
 *     summary: Retrieve list of Income Tax sections
 *     description: Returns a complete list of Income Tax sections registered in the database, with optional filters.
 *     tags:
 *       - Master Salary (Income Tax Section)
 *     parameters:
 *       - in: query
 *         name: it_section
 *         schema:
 *           type: string
 *         description: Case-insensitive sub-string match on the Income Tax section name.
 *       - in: query
 *         name: additraction
 *         schema:
 *           type: string
 *           enum: [Addition, Subtraction]
 *         description: Filter by addition/subtraction mode.
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Filter by audit status.
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Income Tax Section list retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Income Tax Section"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalItSection'
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
 *                   example: "master-salary/Income Tax Section"
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
 *                   example: "master-salary/Income Tax Section"
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
router.get('/', controller.list);

/**
 * @openapi
 * /api/master-salary/sal-it-section/{id}:
 *   get:
 *     summary: Retrieve a specific Income Tax section by ID
 *     tags:
 *       - Master Salary (Income Tax Section)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Income Tax Section record retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Income Tax Section"
 *                 data:
 *                   $ref: '#/components/schemas/SalItSection'
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
 *         description: Not Found
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
router.get('/:id', controller.getById);

/**
 * @openapi
 * /api/master-salary/sal-it-section:
 *   post:
 *     summary: Create a new Income Tax section
 *     tags:
 *       - Master Salary (Income Tax Section)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - it_section
 *               - fk_user_id
 *               - additraction
 *             properties:
 *               it_section:
 *                 type: string
 *                 example: "Section 80D"
 *               deduction:
 *                 type: string
 *                 example: "25000.00"
 *               fk_fy_id:
 *                 type: integer
 *                 example: 2
 *               fk_user_id:
 *                 type: integer
 *                 example: 1
 *               additraction:
 *                 type: string
 *                 enum: [Addition, Subtraction]
 *                 example: "Subtraction"
 *     responses:
 *       201:
 *         description: Created
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
 *                   example: "Income Tax Section created successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Income Tax Section"
 *                 data:
 *                   $ref: '#/components/schemas/SalItSection'
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
 *                       example: "IT section is required"
 *       409:
 *         description: Conflict. IT section name already exists.
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
 *                       example: "Section 80D already exists."
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
router.post('/', controller.create);

/**
 * @openapi
 * /api/master-salary/sal-it-section/{id}:
 *   put:
 *     summary: Update an existing Income Tax section
 *     tags:
 *       - Master Salary (Income Tax Section)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               it_section:
 *                 type: string
 *                 example: "Section 80D"
 *               deduction:
 *                 type: string
 *                 example: "50000.00"
 *               fk_fy_id:
 *                 type: integer
 *                 example: 2
 *               fk_user_id:
 *                 type: integer
 *                 example: 1
 *               additraction:
 *                 type: string
 *                 enum: [Addition, Subtraction]
 *                 example: "Subtraction"
 *     responses:
 *       200:
 *         description: Updated
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
 *                   example: "Income Tax Section updated successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Income Tax Section"
 *                 data:
 *                   $ref: '#/components/schemas/SalItSection'
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
 *         description: Target IT section record not found.
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
 *         description: Conflict. IT section name already exists.
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
 *                       example: "Section 80D already exists."
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
router.put('/:id', controller.update);

/**
 * @openapi
 * /api/master-salary/sal-it-section/{id}:
 *   delete:
 *     summary: Delete an Income Tax section
 *     tags:
 *       - Master Salary (Income Tax Section)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
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
 *                   example: "Income Tax Section deleted successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-12T16:15:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-salary/Income Tax Section"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_sec_id:
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
 *         description: Target IT section record not found.
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
 *         description: Deletion rejected. Either the section is application system-defined or linked to other database dependencies.
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
router.delete('/:id', controller.remove);

export default router;
