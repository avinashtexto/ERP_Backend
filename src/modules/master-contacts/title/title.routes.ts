import { Router } from 'express';

import * as ctrl from './title.controller.js';

// ─────────────────────────────────────────────
// title.routes.ts
// Tag: Master Contacts / Title
// ─────────────────────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     ContTitle:
 *       type: object
 *       description: A salutation title used for contact records (e.g. Mr., Dr., Prof.)
 *       properties:
 *         pk_tit_id:
 *           type: integer
 *           description: Auto-incremented primary key
 *           example: 1
 *         title:
 *           type: string
 *           description: Salutation title (unique, max 15 chars)
 *           maxLength: 15
 *           example: "Dr."
 *         fk_user_id:
 *           type: integer
 *           description: ID of the user who created or last modified this title
 *           example: 4
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last write operation
 *           example: "2026-06-10T12:00:00.000Z"
 *         last_status:
 *           type: string
 *           description: Audit label for the last operation (Added / Edited)
 *           example: "Added"
 *         username:
 *           type: string
 *           nullable: true
 *           description: Resolved display name of the user (joined from app_user)
 *           example: "admin"
 *
 *     CreateTitleRequest:
 *       type: object
 *       required: [title, fk_user_id]
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 15
 *           example: "Prof."
 *         fk_user_id:
 *           type: integer
 *           description: ID of the authenticated user performing this action
 *           example: 4
 *
 *     UpdateTitleRequest:
 *       type: object
 *       description: All fields are optional — only provided fields are updated
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 15
 *           example: "Professor"
 *         sync:
 *           type: string
 *           enum: [N, C, E]
 *           example: "E"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 */

export function titleRouter(): Router {
  const router = Router();

  // ===========================================================================
  // GET /api/master-contacts/title
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/title:
   *   get:
   *     summary: List all contact titles
   *     description: |
   *       Returns a list of all salutation titles (e.g. Mr., Mrs., Dr.) used in contact records.
   *       Supports optional search and audit status filtering.
   *       Results are joined with `app_user` to resolve the `username` field.
   *     tags:
   *       - Master Contacts / Title
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial match filter applied to the title name
   *         example: "Dr"
   *       - in: query
   *         name: last_status
   *         required: false
   *         schema:
   *           type: string
   *         description: Filter by audit status (e.g. Added, Edited)
   *         example: "Added"
   *     responses:
   *       200:
   *         description: Titles retrieved successfully
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
   *                   example: "Titles retrieved successfully"
   *                 module:
   *                   type: string
   *                   example: "title"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ContTitle'
   *       401:
   *         description: Unauthorized — missing or invalid Bearer token
   *       500:
   *         description: Internal server error
   */
  router.get('/', ctrl.getAll);

  // ===========================================================================
  // GET /api/master-contacts/title/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/title/{id}:
   *   get:
   *     summary: Get a title by ID
   *     description: |
   *       Retrieves a single salutation title record by its integer primary key.
   *       The response includes the resolved `username` joined from `app_user`.
   *     tags:
   *       - Master Contacts / Title
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Numeric primary key of the title record
   *         example: 3
   *     responses:
   *       200:
   *         description: Title retrieved successfully
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
   *                   example: "Title retrieved successfully"
   *                 data:
   *                   $ref: '#/components/schemas/ContTitle'
   *       400:
   *         description: Bad Request — ID is not a valid integer
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
   *                       example: "INVALID_ID"
   *                     message:
   *                       type: string
   *                       example: "Title ID must be a valid integer"
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Title not found
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
   *                       example: "NOT_FOUND"
   *                     message:
   *                       type: string
   *                       example: "Title not found"
   */
  router.get('/:id', ctrl.getById);

  // ===========================================================================
  // POST /api/master-contacts/title
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/title:
   *   post:
   *     summary: Create a new contact title
   *     description: |
   *       Creates a new salutation title record. The `title` field must be unique.
   *       A duplicate check is performed before insertion and returns HTTP 409 if a conflict is found.
   *
   *       **Validation rules:**
   *       - `title`: required, 1–15 characters, trimmed
   *       - `fk_user_id`: required, must be a valid positive integer
   *     tags:
   *       - Master Contacts / Title
   *     security:
   *       - bearerAuth: []
   *
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTitleRequest'
   *           example:
   *             title: "Prof."
   *             fk_user_id: 4
   *     responses:
   *       201:
   *         description: Title created successfully
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
   *                   example: "Title \"Prof.\" created successfully."
   *                 data:
   *                   $ref: '#/components/schemas/ContTitle'
   *       400:
   *         description: Validation error — one or more fields failed Zod validation
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
   *                       example: "VALIDATION_ERROR"
   *                     message:
   *                       type: string
   *                       example: "title: Required"
   *       401:
   *         description: Unauthorized
   *       409:
   *         description: Conflict — title name already exists
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
   *                       example: "DUPLICATE"
   *                     message:
   *                       type: string
   *                       example: "Title \"Prof.\" already exists."
   *       500:
   *         description: Internal server error
   */
  router.post('/', ctrl.create);

  // ===========================================================================
  // PUT /api/master-contacts/title/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/title/{id}:
   *   put:
   *     summary: Update an existing contact title
   *     description: |
   *       Performs a partial update on a title record. All fields are optional — only the
   *       provided fields are merged and written. A duplicate name check is performed if
   *       `title` is included in the request body.
   *
   *       `date_time_stamp` and `last_status` are automatically updated to reflect the edit.
   *     tags:
   *       - Master Contacts / Title
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Numeric primary key of the title to update
   *         example: 3
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTitleRequest'
   *           example:
   *             title: "Professor"
   *             fk_user_id: 4
   *     responses:
   *       200:
   *         description: Title updated successfully
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
   *                   example: "Title \"Professor\" updated successfully."
   *                 data:
   *                   $ref: '#/components/schemas/ContTitle'
   *       400:
   *         description: Validation error or invalid ID
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Title not found
   *       409:
   *         description: Duplicate title name conflict
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', ctrl.update);

  // ===========================================================================
  // DELETE /api/master-contacts/title/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/title/{id}:
   *   delete:
   *     summary: Delete a contact title
   *     description: |
   *       Deletes a salutation title record by ID.
   *
   *       **Guards applied before deletion:**
   *       - Returns `409 Conflict` if the title is referenced by any contact record (FK constraint)
   *       - Returns `404 Not Found` if the ID does not exist
   *     tags:
   *       - Master Contacts / Title
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Numeric primary key of the title to delete
   *         example: 3
   *     responses:
   *       200:
   *         description: Title deleted successfully
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
   *                   example: "Title deleted successfully."
   *       400:
   *         description: Bad Request — invalid ID
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden — system-defined title cannot be deleted
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
   *                       example: "FORBIDDEN"
   *                     message:
   *                       type: string
   *                       example: "Cannot delete a system-defined title."
   *       404:
   *         description: Title not found
   *       409:
   *         description: Conflict — title is referenced by contact records
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
   *                       example: "CONFLICT"
   *                     message:
   *                       type: string
   *                       example: "Cannot delete this title because it is referenced by existing contact records."
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', ctrl.deleteTitle);

  return router;
}
