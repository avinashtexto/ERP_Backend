import { Router } from 'express';

import * as controller from './state.controller.js';

// ─────────────────────────────────────────────
// state.routes.ts
// Tag: Master Contacts / State
// ─────────────────────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     ContState:
 *       type: object
 *       properties:
 *         pk_state_id:
 *           type: integer
 *           description: Unique state identifier
 *           example: 1
 *         state:
 *           type: string
 *           maxLength: 30
 *           description: Name of the state
 *           example: "Maharashtra"
 *         fk_ctry_id:
 *           type: integer
 *           description: FK reference to cont_country
 *           example: 217
 *         state_code:
 *           type: string
 *           maxLength: 10
 *           description: Regional code for the state
 *           example: "MH"
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           example: "2026-06-15T12:00:00.000Z"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *         last_status:
 *           type: string
 *           example: "Added"
 *         country:
 *           type: string
 *           description: Resolved country name
 *           example: "India"
 *         username:
 *           type: string
 *           description: Resolved username who created/updated this record
 *           example: "admin"
 *
 *     CreateStateRequest:
 *       type: object
 *       required: [state, fk_ctry_id, fk_user_id]
 *       properties:
 *         state:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: "Maharashtra"
 *         fk_ctry_id:
 *           type: integer
 *           example: 217
 *         state_code:
 *           type: string
 *           maxLength: 10
 *           example: "MH"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *
 *     UpdateStateRequest:
 *       type: object
 *       properties:
 *         state:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: "Maharashtra Region"
 *         fk_ctry_id:
 *           type: integer
 *           example: 217
 *         state_code:
 *           type: string
 *           maxLength: 10
 *           example: "MR"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 */

export function stateRouter(): Router {
  const router = Router();

  /**
   * @openapi
   * /api/master-contacts/state/dropdown:
   *   get:
   *     summary: Get state dropdown list
   *     description: Returns a list of states sorted by name for populating dropdown selections. Can filter states belonging to a specific country.
   *     tags:
   *       - Master Contacts / State
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: countryId
   *         schema:
   *           type: integer
   *         required: false
   *         description: Filter states belonging to this specific country ID
   *         example: 217
   *     responses:
   *       200:
   *         description: State dropdown list retrieved successfully
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
   *                   example: "State dropdown retrieved successfully"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ContState'
   *                 module:
   *                   type: string
   *                   example: "state"
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.get('/dropdown', controller.getDropdown);

  /**
   * @openapi
   * /api/master-contacts/state:
   *   get:
   *     tags:
   *       - Master Contacts / State
   *     summary: List all States
   *     description: Returns a paginated, filterable list of State records joined with country and user information.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: state
   *         schema: { type: string }
   *         description: Filter by State name prefix
   *       - in: query
   *         name: country
   *         schema: { type: string }
   *         description: Filter by Country name prefix
   *       - in: query
   *         name: state_code
   *         schema: { type: string }
   *         description: Filter by State Code prefix
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
   *         description: Paginated State list
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
   *                   example: "States list retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     rows:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/ContState'
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
  router.get('/', controller.getStates);

  /**
   * @openapi
   * /api/master-contacts/state/{id}:
   *   get:
   *     tags:
   *       - Master Contacts / State
   *     summary: Get a single State by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *         description: Numeric primary key of the State record
   *     responses:
   *       200:
   *         description: State record retrieved
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
   *                   example: "State retrieved successfully"
   *                 data:
   *                   $ref: '#/components/schemas/ContState'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: State not found
   */
  router.get('/:id', controller.getStateById);

  /**
   * @openapi
   * /api/master-contacts/state:
   *   post:
   *     tags:
   *       - Master Contacts / State
   *     summary: Create a new State
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/CreateStateRequest' }
   *     responses:
   *       201:
   *         description: State created successfully
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
   *                   example: "State created successfully"
   *                 data:
   *                   $ref: '#/components/schemas/ContState'
   *       401:
   *         description: Unauthorized
   *       409:
   *         description: Conflict — State name already exists in this country
   */
  router.post('/', controller.createState);

  /**
   * @openapi
   * /api/master-contacts/state/{id}:
   *   put:
   *     tags:
   *       - Master Contacts / State
   *     summary: Update an existing State
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *         description: Numeric primary key of the State record
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/UpdateStateRequest' }
   *     responses:
   *       200:
   *         description: State updated successfully
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
   *                   example: "State updated successfully"
   *                 data:
   *                   $ref: '#/components/schemas/ContState'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: State not found
   *       409:
   *         description: Duplicate State name conflict within the country
   */
  router.put('/:id', controller.updateState);

  /**
   * @openapi
   * /api/master-contacts/state/{id}:
   *   delete:
   *     tags:
   *       - Master Contacts / State
   *     summary: Delete a State
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *         description: Numeric primary key of the State record
   *     responses:
   *       200:
   *         description: State deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden — System-defined record cannot be deleted
   *       404:
   *         description: State not found
   *       409:
   *         description: Conflict — Referenced by city or other records
   */
  router.delete('/:id', controller.deleteState);

  return router;
}
