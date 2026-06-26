import { Router } from 'express';

import * as controller from './master-salary.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     SalSkintone:
 *       type: object
 *       required:
 *         - pk_st_id
 *         - colour
 *         - sync
 *         - fk_user_id
 *         - last_status
 *       properties:
 *         pk_st_id:
 *           type: integer
 *           description: Unique primary key ID for the skintone record, automatically incremented.
 *           example: 1
 *         colour:
 *           type: string
 *           description: Descriptive name/identifier of the skin tone colour variant (length 1-25 characters).
 *           example: "Fair"
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp showing when this skintone record was last updated.
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
 *     SalCastes:
 *       type: object
 *       required:
 *         - pk_cs_id
 *         - caste
 *         - sync
 *         - fk_user_id
 *         - last_status
 *       properties:
 *         pk_cs_id:
 *           type: integer
 *           description: Unique primary key ID for the caste record, automatically incremented.
 *           example: 1
 *         caste:
 *           type: string
 *           description: Descriptive name/identifier of the caste group classification (length 1-40 characters).
 *           example: "General"
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp showing when this caste record was last updated.
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
 *     SalReligion:
 *       type: object
 *       required:
 *         - pk_rg_id
 *         - religion
 *         - sync
 *         - fk_user_id
 *         - last_status
 *       properties:
 *         pk_rg_id:
 *           type: integer
 *           description: Unique primary key ID for the religion record, automatically incremented.
 *           example: 1
 *         religion:
 *           type: string
 *           description: Descriptive name of the religion classification (length 1-50 characters).
 *           example: "Christianity"
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp showing when this religion record was last updated.
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
 *     SalScheduleType:
 *       type: object
 *       required:
 *         - pk_st_id
 *         - type
 *         - sync
 *         - fk_user_id
 *         - last_status
 *       properties:
 *         pk_st_id:
 *           type: integer
 *           description: Unique primary key ID for the schedule type record, automatically incremented.
 *           example: 1
 *         type:
 *           type: string
 *           description: Descriptive name of the scheduling pattern (length 1-100 characters).
 *           example: "General Shift"
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp showing when this schedule type record was last updated.
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
 *     MasterSalaryError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message details"
 *         timestamp:
 *           type: string
 *           example: "2026-06-09T11:00:00.000Z"
 *         module:
 *           type: string
 *           example: "master-salary/Skintone"
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "NOT_FOUND"
 *             details:
 *               type: string
 *               example: "SalSkintone record not found."
 */

// ============================================================================
// Skintone Routes
// ============================================================================

/**
 * @openapi
 * /api/master-salary/skintone:
 *   get:
 *     summary: Retrieve list of sal skintones
 *     description: Returns a complete list of skintone categories registered in the database, with optional filters for name prefixing and status audits.
 *     tags:
 *       - Master Salary (Skintones)
 *     parameters:
 *       - in: query
 *         name: colour
 *         schema:
 *           type: string
 *         description: Case-insensitive sub-string match on the skin tone colour variant name.
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Case-insensitive match on the audit record status.
 *     responses:
 *       200:
 *         description: List of skintone entries returned successfully.
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
 *                   example: "SalSkintones retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalSkintone'
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.get('/skintone', controller.getAllSkintones);

/**
 * @openapi
 * /api/master-salary/skintone/{id}:
 *   get:
 *     summary: Retrieve a specific sal skintone by ID
 *     description: Returns detailed fields of a single registered skintone record by its unique database primary key integer ID.
 *     tags:
 *       - Master Salary (Skintones)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target skintone record.
 *     responses:
 *       200:
 *         description: Detailed fields for the target skintone returned successfully.
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
 *                   example: "SalSkintone retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalSkintone'
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Record with the specified ID could not be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.get('/skintone/:id', controller.getSkintoneById);

/**
 * @openapi
 * /api/master-salary/skintone:
 *   post:
 *     summary: Create a new sal skintone
 *     description: Registers a new custom skintone category. Validates uniqueness constraints on the colour name.
 *     tags:
 *       - Master Salary (Skintones)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - colour
 *               - fk_user_id
 *             properties:
 *               colour:
 *                 type: string
 *                 description: Colour name variant (1-25 characters).
 *                 example: "Fair"
 *               fk_user_id:
 *                 type: integer
 *                 description: Creator admin user ID.
 *                 example: 1
 *     responses:
 *       201:
 *         description: New skintone category successfully created.
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
 *                   example: "SalSkintone created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalSkintone'
 *       400:
 *         description: Request payload validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Uniqueness constraint conflict. Skintone colour already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.post('/skintone', controller.createSkintone);

/**
 * @openapi
 * /api/master-salary/skintone/{id}:
 *   put:
 *     summary: Update an existing sal skintone
 *     description: Updates properties of a specific custom skintone. Ensures modified colour names do not conflict with existing records.
 *     tags:
 *       - Master Salary (Skintones)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target skintone to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               colour:
 *                 type: string
 *                 description: Revised colour name variant (1-25 characters).
 *                 example: "Light Tan"
 *               fk_user_id:
 *                 type: integer
 *                 description: Modifying admin user ID.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Skintone properties successfully updated.
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
 *                   example: "SalSkintone updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalSkintone'
 *       400:
 *         description: Request payload validation failed or ID format is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Target skintone record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Skintone colour already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.put('/skintone/:id', controller.updateSkintone);

/**
 * @openapi
 * /api/master-salary/skintone/{id}:
 *   delete:
 *     summary: Delete a sal skintone by ID
 *     description: Deletes the target custom skintone category.
 *     tags:
 *       - Master Salary (Skintones)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target skintone to delete.
 *     responses:
 *       200:
 *         description: Skintone category successfully deleted.
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
 *                   example: "SalSkintone deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_st_id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Target skintone record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Deletion rejected because the target record is linked to other database dependencies.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.delete('/skintone/:id', controller.removeSkintone);

// ============================================================================
// Castes Routes
// ============================================================================

/**
 * @openapi
 * /api/master-salary/caste:
 *   get:
 *     summary: Retrieve list of sal castes
 *     description: Returns a complete list of castes registered in the database, with optional filters for name prefixing and status audits.
 *     tags:
 *       - Master Salary (Castes)
 *     parameters:
 *       - in: query
 *         name: caste
 *         schema:
 *           type: string
 *         description: Case-insensitive sub-string match on the caste name.
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Case-insensitive match on the audit record status.
 *     responses:
 *       200:
 *         description: List of caste entries returned successfully.
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
 *                   example: "SalCastes retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalCastes'
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.get('/caste', controller.getAllCastes);

/**
 * @openapi
 * /api/master-salary/caste/{id}:
 *   get:
 *     summary: Retrieve a specific sal caste by ID
 *     description: Returns detailed fields of a single registered caste record by its unique database primary key integer ID.
 *     tags:
 *       - Master Salary (Castes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target caste record.
 *     responses:
 *       200:
 *         description: Detailed fields for the target caste returned successfully.
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
 *                   example: "SalCaste retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalCastes'
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Record with the specified ID could not be found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.get('/caste/:id', controller.getCasteById);

/**
 * @openapi
 * /api/master-salary/caste:
 *   post:
 *     summary: Create a new sal caste
 *     description: Registers a new caste category. Validates uniqueness constraints on the caste name.
 *     tags:
 *       - Master Salary (Castes)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caste
 *               - fk_user_id
 *             properties:
 *               caste:
 *                 type: string
 *                 description: Caste name variant (1-40 characters).
 *                 example: "General"
 *               fk_user_id:
 *                 type: integer
 *                 description: Creator admin user ID.
 *                 example: 1
 *     responses:
 *       201:
 *         description: New caste category successfully created.
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
 *                   example: "SalCaste created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalCastes'
 *       400:
 *         description: Request payload validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Caste name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.post('/caste', controller.createCaste);

/**
 * @openapi
 * /api/master-salary/caste/{id}:
 *   put:
 *     summary: Update an existing sal caste
 *     description: Updates properties of a specific custom caste. Ensures modified caste names do not conflict with existing records.
 *     tags:
 *       - Master Salary (Castes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target caste to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caste:
 *                 type: string
 *                 description: Revised caste name variant (1-40 characters).
 *                 example: "OBC"
 *               fk_user_id:
 *                 type: integer
 *                 description: Modifying admin user ID.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Caste properties successfully updated.
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
 *                   example: "SalCaste updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalCastes'
 *       400:
 *         description: Request payload validation failed or ID format is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Target caste record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Caste name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.put('/caste/:id', controller.updateCaste);

/**
 * @openapi
 * /api/master-salary/caste/{id}:
 *   delete:
 *     summary: Delete a sal caste by ID
 *     description: Deletes the target custom caste category.
 *     tags:
 *       - Master Salary (Castes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target caste to delete.
 *     responses:
 *       200:
 *         description: Caste category successfully deleted.
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
 *                   example: "SalCaste deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_cs_id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Target caste record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Deletion rejected because the target record is linked to other database dependencies.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.delete('/caste/:id', controller.removeCaste);

// ============================================================================
// Religion Routes
// ============================================================================

/**
 * @openapi
 * /api/master-salary/religion:
 *   get:
 *     summary: Retrieve list of sal religions
 *     description: Returns a complete list of religions registered in the database, with optional filters.
 *     tags:
 *       - Master Salary (Religions)
 *     parameters:
 *       - in: query
 *         name: religion
 *         schema:
 *           type: string
 *         description: Filter by religion name prefix match.
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Filter by last status audit state.
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
 *                   example: "SalReligions retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalReligion'
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.get('/religion', controller.getAllReligions);

/**
 * @openapi
 * /api/master-salary/religion/{id}:
 *   get:
 *     summary: Retrieve a specific sal religion by ID
 *     description: Returns detailed fields of a single religion record.
 *     tags:
 *       - Master Salary (Religions)
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
 *                   example: "SalReligion retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalReligion'
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.get('/religion/:id', controller.getReligionById);

/**
 * @openapi
 * /api/master-salary/religion:
 *   post:
 *     summary: Create a new sal religion
 *     description: Registers a new religion. Validates uniqueness constraints on the name.
 *     tags:
 *       - Master Salary (Religions)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - religion
 *               - fk_user_id
 *             properties:
 *               religion:
 *                 type: string
 *                 example: "Hinduism"
 *               fk_user_id:
 *                 type: integer
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
 *                   example: "SalReligion created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalReligion'
 *       400:
 *         description: Request payload validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Religion name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.post('/religion', controller.createReligion);

/**
 * @openapi
 * /api/master-salary/religion/{id}:
 *   put:
 *     summary: Update an existing sal religion
 *     tags:
 *       - Master Salary (Religions)
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
 *               religion:
 *                 type: string
 *               fk_user_id:
 *                 type: integer
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
 *                   example: "SalReligion updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalReligion'
 *       400:
 *         description: Request payload validation failed or ID format is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Target religion record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Religion name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.put('/religion/:id', controller.updateReligion);

/**
 * @openapi
 * /api/master-salary/religion/{id}:
 *   delete:
 *     summary: Delete a sal religion by ID
 *     description: Deletes the target religion category.
 *     tags:
 *       - Master Salary (Religions)
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
 *                   example: "SalReligion deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_rg_id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Target religion record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Deletion rejected because the target record is linked to other database dependencies.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.delete('/religion/:id', controller.removeReligion);

// ============================================================================
// ScheduleType Routes
// ============================================================================

/**
 * @openapi
 * /api/master-salary/schedule-type:
 *   get:
 *     summary: Retrieve list of sal schedule types
 *     description: Returns a complete list of schedule types registered in the database, with optional filters.
 *     tags:
 *       - Master Salary (Schedule Types)
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by schedule type name prefix match.
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Filter by last status audit state.
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
 *                   example: "SalScheduleTypes retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalScheduleType'
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.get('/schedule-type', controller.getAllScheduleTypes);

/**
 * @openapi
 * /api/master-salary/schedule-type/{id}:
 *   get:
 *     summary: Retrieve a specific sal schedule type by ID
 *     description: Returns detailed fields of a single schedule type record.
 *     tags:
 *       - Master Salary (Schedule Types)
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
 *                   example: "SalScheduleType retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalScheduleType'
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.get('/schedule-type/:id', controller.getScheduleTypeById);

/**
 * @openapi
 * /api/master-salary/schedule-type:
 *   post:
 *     summary: Create a new sal schedule type
 *     description: Registers a new schedule type. Validates uniqueness constraints on the name.
 *     tags:
 *       - Master Salary (Schedule Types)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - fk_user_id
 *             properties:
 *               type:
 *                 type: string
 *                 example: "Night Shift"
 *               fk_user_id:
 *                 type: integer
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
 *                   example: "SalScheduleType created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalScheduleType'
 *       400:
 *         description: Request payload validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Schedule type name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.post('/schedule-type', controller.createScheduleType);

/**
 * @openapi
 * /api/master-salary/schedule-type/{id}:
 *   put:
 *     summary: Update an existing sal schedule type
 *     tags:
 *       - Master Salary (Schedule Types)
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
 *               type:
 *                 type: string
 *               fk_user_id:
 *                 type: integer
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
 *                   example: "SalScheduleType updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SalScheduleType'
 *       400:
 *         description: Request payload validation failed or ID format is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Target schedule type record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Schedule type name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.put('/schedule-type/:id', controller.updateScheduleType);

/**
 * @openapi
 * /api/master-salary/schedule-type/{id}:
 *   delete:
 *     summary: Delete a sal schedule type by ID
 *     description: Deletes the target schedule type category.
 *     tags:
 *       - Master Salary (Schedule Types)
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
 *                   example: "SalScheduleType deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_st_id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       404:
 *         description: Target schedule type record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       409:
 *         description: Deletion rejected because the target record is linked to other database dependencies.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterSalaryError'
 */
router.delete('/schedule-type/:id', controller.removeScheduleType);

export default router;
