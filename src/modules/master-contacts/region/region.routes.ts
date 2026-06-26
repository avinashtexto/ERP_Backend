import { Router } from 'express';

import * as controller from './region.controller.js';

export const regionRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ContRegion:
 *       type: object
 *       properties:
 *         pk_reg_id:
 *           type: integer
 *           description: Auto-incremented primary key
 *           example: 1
 *         region:
 *           type: string
 *           description: Area/Region/Shipping Location name
 *           maxLength: 30
 *           example: "North Zone"
 *         rate1:
 *           type: string
 *           description: Trip Rate value
 *           example: "150.00"
 *         rate2:
 *           type: string
 *           description: Extra Charges (Trip) value
 *           example: "25.00"
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
 *         username:
 *           type: string
 *           description: Resolved username who created/updated this record
 *           example: "admin"
 *
 *     CreateRegionRequest:
 *       type: object
 *       required: [region, rate1, rate2, fk_user_id]
 *       properties:
 *         region:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: "North Zone"
 *         rate1:
 *           type: number
 *           example: 150.00
 *         rate2:
 *           type: number
 *           example: 25.00
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *
 *     UpdateRegionRequest:
 *       type: object
 *       properties:
 *         region:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: "North Zone Update"
 *         rate1:
 *           type: number
 *           example: 160.00
 *         rate2:
 *           type: number
 *           example: 30.00
 *         fk_user_id:
 *           type: integer
 *           example: 4
 */

/**
 * @openapi
 * /api/master-contacts/region/dropdown:
 *   get:
 *     tags:
 *       - Master Contacts / Region
 *     summary: Get all Regions for dropdown selection
 *     description: Returns a list of all regions sorted by name.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of regions retrieved successfully
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
 *                   example: "Region dropdown retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContRegion'
 *       401:
 *         description: Unauthorized
 */
regionRouter.get('/dropdown', controller.getDropdown);

/**
 * @openapi
 * /api/master-contacts/region:
 *   get:
 *     tags:
 *       - Master Contacts / Region
 *     summary: List all Regions
 *     description: Returns a paginated, filterable list of Region records.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: region
 *         schema: { type: string }
 *         description: Filter by Region name prefix
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
 *         description: Paginated Region list
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
 *                   example: "Regions list retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rows:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ContRegion'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     page_size:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
regionRouter.get('/', controller.getRegions);

/**
 * @openapi
 * /api/master-contacts/region/{id}:
 *   get:
 *     tags:
 *       - Master Contacts / Region
 *     summary: Get a single Region by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Numeric primary key of the Region record
 *     responses:
 *       200:
 *         description: Region record retrieved
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
 *                   example: "Region retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ContRegion'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Region not found
 */
regionRouter.get('/:id', controller.getRegionById);

/**
 * @openapi
 * /api/master-contacts/region:
 *   post:
 *     tags:
 *       - Master Contacts / Region
 *     summary: Create a new Region
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateRegionRequest' }
 *     responses:
 *       201:
 *         description: Region created successfully
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
 *                   example: "Region created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ContRegion'
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict — Region name already exists
 */
regionRouter.post('/', controller.createRegion);

/**
 * @openapi
 * /api/master-contacts/region/{id}:
 *   put:
 *     tags:
 *       - Master Contacts / Region
 *     summary: Update an existing Region
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Numeric primary key of the Region record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateRegionRequest' }
 *     responses:
 *       200:
 *         description: Region updated successfully
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
 *                   example: "Region updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ContRegion'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Region not found
 *       409:
 *         description: Duplicate Region name conflict
 */
regionRouter.put('/:id', controller.updateRegion);

/**
 * @openapi
 * /api/master-contacts/region/{id}:
 *   delete:
 *     tags:
 *       - Master Contacts / Region
 *     summary: Delete a Region
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Numeric primary key of the Region record
 *     responses:
 *       200:
 *         description: Region deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — System-defined record cannot be deleted
 *       404:
 *         description: Region not found
 *       409:
 *         description: Conflict — Referenced by other records
 */
regionRouter.delete('/:id', controller.deleteRegion);
