import { Router } from 'express';

import * as controller from './mode-of-contact.controller.js';

export const modeOfContactRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ContModeOfContact:
 *       type: object
 *       properties:
 *         pk_moc_id:
 *           type: integer
 *           description: Auto-incremented primary key
 *           example: 1
 *         moc:
 *           type: string
 *           description: Mode of Contact value
 *           maxLength: 25
 *           example: "Email"
 *         fk_mt_id:
 *           type: integer
 *           description: Foreign key to ContMOCType table
 *           example: 2
 *         date_timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-06-15T12:00:00.000Z"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *         last_status:
 *           type: string
 *           example: "Added"
 *         mode:
 *           type: string
 *           description: Resolved mode from ContMOCType
 *           example: "Online"
 *         username:
 *           type: string
 *           description: Resolved username who created/updated this record
 *           example: "admin"
 *
 *     CreateModeOfContactRequest:
 *       type: object
 *       required: [moc, fk_mt_id, fk_user_id]
 *       properties:
 *         moc:
 *           type: string
 *           minLength: 1
 *           maxLength: 25
 *           example: "WhatsApp"
 *         fk_mt_id:
 *           type: integer
 *           example: 2
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *
 *     UpdateModeOfContactRequest:
 *       type: object
 *       properties:
 *         moc:
 *           type: string
 *           minLength: 1
 *           maxLength: 25
 *           example: "Business WhatsApp"
 *         fk_mt_id:
 *           type: integer
 *           example: 2
 *         fk_user_id:
 *           type: integer
 *           example: 4
 */

/**
 * @openapi
 * /api/master-contacts/mode-of-contact:
 *   get:
 *     tags:
 *       - Master Contacts / Mode of Contact
 *     summary: List all Modes of Contact
 *     description: Returns a paginated, filterable list of Mode of Contact records joined with type and user information.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: moc
 *         schema: { type: string }
 *         description: Filter by Mode of Contact name prefix
 *       - in: query
 *         name: mode
 *         schema: { type: string }
 *         description: Filter by Mode of Contact Type mode prefix
 *       - in: query
 *         name: last_status
 *         schema: { type: string }
 *         description: Filter by last status prefix
 *       - in: query
 *         name: username
 *         schema: { type: string }
 *         description: Filter by username prefix
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Paginated Mode of Contact list
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
 *                   example: "Modes of Contact list retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rows:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ContModeOfContact'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     page_size:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
modeOfContactRouter.get('/', controller.getModesOfContact);

/**
 * @openapi
 * /api/master-contacts/mode-of-contact/types:
 *   get:
 *     tags:
 *       - Master Contacts / Mode of Contact
 *     summary: Get all Mode of Contact Types
 *     description: Returns a complete list of Mode of Contact Types for dropdown list selection.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Mode of Contact types retrieved successfully
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
 *                   example: "Mode of Contact Types retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pk_mt_id:
 *                         type: integer
 *                       mode:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
modeOfContactRouter.get('/types', controller.getModeOfContactTypes);

/**
 * @openapi
 * /api/master-contacts/mode-of-contact/{id}:
 *   get:
 *     tags:
 *       - Master Contacts / Mode of Contact
 *     summary: Get a single Mode of Contact by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Numeric primary key of the Mode of Contact record
 *     responses:
 *       200:
 *         description: Mode of Contact record retrieved
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
 *                   example: "Mode of Contact retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ContModeOfContact'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mode of Contact not found
 */
modeOfContactRouter.get('/:id', controller.getModeOfContactById);

/**
 * @openapi
 * /api/master-contacts/mode-of-contact:
 *   post:
 *     tags:
 *       - Master Contacts / Mode of Contact
 *     summary: Create a new Mode of Contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateModeOfContactRequest' }
 *     responses:
 *       201:
 *         description: Mode of Contact created successfully
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
 *                   example: "Mode of Contact created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ContModeOfContact'
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict — Mode of Contact name already exists
 */
modeOfContactRouter.post('/', controller.createModeOfContact);

/**
 * @openapi
 * /api/master-contacts/mode-of-contact/{id}:
 *   put:
 *     tags:
 *       - Master Contacts / Mode of Contact
 *     summary: Update an existing Mode of Contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Numeric primary key of the Mode of Contact record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateModeOfContactRequest' }
 *     responses:
 *       200:
 *         description: Mode of Contact updated successfully
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
 *                   example: "Mode of Contact updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ContModeOfContact'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mode of Contact not found
 *       409:
 *         description: Duplicate Mode of Contact name conflict
 */
modeOfContactRouter.put('/:id', controller.updateModeOfContact);

/**
 * @openapi
 * /api/master-contacts/mode-of-contact/{id}:
 *   delete:
 *     tags:
 *       - Master Contacts / Mode of Contact
 *     summary: Delete a Mode of Contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Numeric primary key of the Mode of Contact record
 *     responses:
 *       200:
 *         description: Mode of Contact deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — System-defined record cannot be deleted
 *       404:
 *         description: Mode of Contact not found
 *       409:
 *         description: Conflict — Referenced by other records
 */
modeOfContactRouter.delete('/:id', controller.deleteModeOfContact);
