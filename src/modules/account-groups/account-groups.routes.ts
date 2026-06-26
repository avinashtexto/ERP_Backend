import { Router } from 'express';

import * as controller from './account-groups.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     AcctGroup:
 *       type: object
 *       properties:
 *         pk_grp_id:
 *           type: integer
 *           description: Unique numeric ID for the group
 *           example: 21
 *         group_name:
 *           type: string
 *           description: Descriptive name of the group
 *           example: "Direct Expenses"
 *         fk_main_id:
 *           type: integer
 *           description: ID of the root/main group ancestor
 *           example: 1
 *         fk_sub_id:
 *           type: integer
 *           description: ID of the sub-group anchor node
 *           example: 21
 *         fk_prt_id:
 *           type: integer
 *           description: ID of the direct parent group node
 *           example: 1
 *         grouping:
 *           type: integer
 *           description: Numeric classification grouping value
 *           example: 101
 *         prefix:
 *           type: string
 *           description: Hierarchy prefix letter or character
 *           example: "D"
 *         dc:
 *           type: string
 *           enum: [DR, CR]
 *           description: Debit or Credit accounting variant designation
 *           example: "DR"
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of creation or last edit
 *           example: "2026-06-05T12:00:00.000Z"
 *         fk_user_id:
 *           type: integer
 *           description: User identifier of the editor
 *           example: 1
 *         last_status:
 *           type: string
 *           description: Audit state status
 *           example: "Added"
 *         parent_name:
 *           type: string
 *           nullable: true
 *           description: Resolved group name of the parent node
 *           example: "Expenses"
 *         username:
 *           type: string
 *           nullable: true
 *           description: Username of the creator or last modifier
 *           example: "admin"
 *     AcctGroupTreeNode:
 *       type: object
 *       properties:
 *         pk_grp_id:
 *           type: integer
 *           example: 21
 *         group_name:
 *           type: string
 *           example: "Direct Expenses"
 *         fk_main_id:
 *           type: integer
 *           example: 1
 *         fk_sub_id:
 *           type: integer
 *           example: 21
 *         fk_prt_id:
 *           type: integer
 *           example: 1
 *         grouping:
 *           type: integer
 *           example: 101
 *         prefix:
 *           type: string
 *           example: "D"
 *         dc:
 *           type: string
 *           example: "DR"
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AcctGroupTreeNode'
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation failed or resource not found"
 */

/**
 * @openapi
 * /api/account-groups:
 *   get:
 *     summary: Retrieve user-defined account groups
 *     description: Returns a list of user-defined account groups (pk_grp_id > 20) with optional filters.
 *     tags:
 *       - Account Groups
 *     parameters:
 *       - in: query
 *         name: group_name
 *         schema:
 *           type: string
 *         description: Filter by matching group name prefix
 *       - in: query
 *         name: parent_name
 *         schema:
 *           type: string
 *         description: Filter by matching parent group name prefix
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by modifier username prefix
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Filter by audit status (e.g. Added, Edited)
 *       - in: query
 *         name: date_time_stamp
 *         schema:
 *           type: string
 *         description: Filter by timestamp matches
 *     responses:
 *       200:
 *         description: Successfully retrieved user-defined account groups.
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
 *                   example: "Account groups retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AcctGroup'
 */
router.get('/', controller.getAll);

/**
 * @openapi
 * /api/account-groups/tree:
 *   get:
 *     summary: Retrieve full account groups tree hierarchy
 *     description: Returns the entire account groups organizational structure as a nested tree, including system-defined nodes. Optimized for hierarchy list visualization.
 *     tags:
 *       - Account Groups
 *     responses:
 *       200:
 *         description: Hierarchical tree structure returned successfully.
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
 *                   example: "Account groups hierarchy tree retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AcctGroupTreeNode'
 */
router.get('/tree', controller.getTree);

/**
 * @openapi
 * /api/account-groups/parents:
 *   get:
 *     summary: Retrieve potential parent candidates
 *     description: Returns account groups that are eligible to serve as parent nodes (where pk_grp_id equals fk_sub_id).
 *     tags:
 *       - Account Groups
 *     responses:
 *       200:
 *         description: Eligible parent candidate list returned successfully.
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
 *                   example: "Parent candidates retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AcctGroup'
 */
router.get('/parents', controller.getParents);

/**
 * @openapi
 * /api/account-groups:
 *   post:
 *     summary: Create a new account group
 *     description: Creates a new user-defined account group. Inherits core attributes (prefix, debit/credit orientation, grouping) from the specified parent.
 *     tags:
 *       - Account Groups
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_name
 *               - fk_prt_id
 *               - grouping
 *               - prefix
 *               - dc
 *               - fk_user_id
 *             properties:
 *               pk_grp_id:
 *                 type: integer
 *                 description: Optional unique numeric ID for the group. Auto-generated via sequence if omitted.
 *               group_name:
 *                 type: string
 *                 description: Descriptive name for the group (max 40 chars)
 *               fk_prt_id:
 *                 type: integer
 *                 description: ID of the parent account group
 *               grouping:
 *                 type: integer
 *                 description: Structural grouping categorization
 *               prefix:
 *                 type: string
 *                 maxLength: 1
 *                 description: Hierarchy prefix code character
 *               dc:
 *                 type: string
 *                 enum: [DR, CR, D, C]
 *                 description: Debit or Credit designation
 *               fk_user_id:
 *                 type: string
 *                 description: ID of the creator user
 *     responses:
 *       201:
 *         description: Account group successfully created.
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
 *                   example: "Account group created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AcctGroup'
 *       400:
 *         description: Bad request. Name uniqueness constraint violated or validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/', controller.create);

/**
 * @openapi
 * /api/account-groups/{id}:
 *   get:
 *     summary: Retrieve an account group by ID
 *     description: Returns detailed fields for a specific account group by its unique ID.
 *     tags:
 *       - Account Groups
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target group
 *     responses:
 *       200:
 *         description: Target account group retrieved successfully.
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
 *                   example: "Account group retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AcctGroup'
 *       404:
 *         description: Account group record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /api/account-groups/{id}:
 *   put:
 *     summary: Update an account group by ID
 *     description: Updates editable properties on the target account group. Re-evaluates hierarchy inheritance rules if the parent node changes.
 *     tags:
 *       - Account Groups
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_name:
 *                 type: string
 *               fk_prt_id:
 *                 type: integer
 *               sync:
 *                 type: string
 *                 enum: [N, C, E]
 *               fk_user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account group successfully updated.
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
 *                   example: "Account group updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AcctGroup'
 *       400:
 *         description: Bad request. Validation failed or name collision.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Account group record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /api/account-groups/{id}:
 *   delete:
 *     summary: Delete an account group by ID
 *     description: Deletes the target account group if it is not system-defined and has no dependent references.
 *     tags:
 *       - Account Groups
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target group
 *     responses:
 *       200:
 *         description: Account group successfully deleted.
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
 *                   example: "Account group deleted successfully"
 *       400:
 *         description: Deletion rejected due to system-defined guard or foreign key constraints.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Account group record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.delete('/:id', controller.remove);

export default router;
