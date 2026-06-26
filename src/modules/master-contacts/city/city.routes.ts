import { Router } from 'express';

import * as ctrl from './city.controller.js';

// ─────────────────────────────────────────────
// city.routes.ts
// Tag: Master Contacts / City
// ─────────────────────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     ContCity:
 *       type: object
 *       description: A city/town record used to categorize contact addresses
 *       properties:
 *         pk_city_id:
 *           type: string
 *           maxLength: 7
 *           description: User-supplied 7-character alphanumeric city code (primary key)
 *           example: "MUM0001"
 *         city:
 *           type: string
 *           maxLength: 30
 *           description: City or town name (unique)
 *           example: "Mumbai"
 *         fk_state_id:
 *           type: integer
 *           nullable: true
 *           description: FK reference to cont_state (optional)
 *           example: 1
 *         fk_ctry_id:
 *           type: integer
 *           description: FK reference to cont_country (required)
 *           example: 101
 *         std_code:
 *           type: string
 *           maxLength: 10
 *           description: STD / area dialing code for the city
 *           example: "022"
 *         fk_user_id:
 *           type: integer
 *           description: ID of the user who created or last modified this record
 *           example: 4
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last write operation
 *           example: "2026-06-10T12:00:00.000Z"
 *         last_status:
 *           type: string
 *           description: Audit label for the last operation
 *           example: "Added"
 *
 *     CityDropdownItem:
 *       type: object
 *       description: Enriched city record for combo-box / dropdown population
 *       properties:
 *         pk_city_id:
 *           type: string
 *           example: "MUM0001"
 *         city:
 *           type: string
 *           example: "Mumbai"
 *         fk_state_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         fk_ctry_id:
 *           type: integer
 *           example: 101
 *         std_code:
 *           type: string
 *           example: "022"
 *         state:
 *           type: string
 *           nullable: true
 *           description: Resolved state name (joined)
 *           example: "Maharashtra"
 *         country:
 *           type: string
 *           nullable: true
 *           description: Resolved country name (joined)
 *           example: "India"
 *         isd_code:
 *           type: string
 *           nullable: true
 *           description: International dialing code (joined from country)
 *           example: "+91"
 *
 *     CreateCityRequest:
 *       type: object
 *       required: [pk_city_id, city, fk_ctry_id, fk_user_id]
 *       properties:
 *         pk_city_id:
 *           type: string
 *           length: 7
 *           pattern: "^[A-Za-z0-9]{7}$"
 *           example: "MUM0001"
 *         city:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: "Mumbai"
 *         fk_state_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         fk_ctry_id:
 *           type: integer
 *           example: 101
 *         std_code:
 *           type: string
 *           maxLength: 10
 *           example: "022"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *
 *     UpdateCityRequest:
 *       type: object
 *       description: All fields are optional — only provided fields are updated
 *       properties:
 *         city:
 *           type: string
 *           maxLength: 30
 *           example: "Greater Mumbai"
 *         fk_state_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         fk_ctry_id:
 *           type: integer
 *           example: 101
 *         std_code:
 *           type: string
 *           maxLength: 10
 *           example: "022"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 */

export function cityRouter(): Router {
  const router = Router();

  // ===========================================================================
  // GET /api/master-contacts/city/dropdown
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/city/dropdown:
   *   get:
   *     summary: Lightweight city list for combo-boxes (FillCity)
   *     description: |
   *       Returns all cities joined with their state and country for use in dropdown or combo-box
   *       population. This is a fast, unfiltered endpoint equivalent to the VB `FillCity()` function.
   *       The response includes ISD code and STD code for phone number formatting.
   *     tags:
   *       - Master Contacts / City
   *     security:
   *       - bearerAuth: []
   *
   *     responses:
   *       200:
   *         description: City dropdown list retrieved successfully
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
   *                   example: "City dropdown retrieved successfully"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/CityDropdownItem'
   *       401:
   *         description: Unauthorized — missing or invalid Bearer token
   *       500:
   *         description: Internal server error
   */
  router.get('/dropdown', ctrl.getDropdown);

  // ===========================================================================
  // GET /api/master-contacts/city
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/city:
   *   get:
   *     summary: List cities with pagination and filters
   *     description: |
   *       Returns a paginated list of cities joined with state and country. Supports partial-match
   *       filters on city name, state name, and country name — equivalent to the VB `FillList()` /
   *       `grList` filter functionality.
   *     tags:
   *       - Master Contacts / City
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: city
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial match on city name (prefix search)
   *         example: "Mum"
   *       - in: query
   *         name: state
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial match on resolved state name
   *         example: "Maha"
   *       - in: query
   *         name: country
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial match on resolved country name
   *         example: "India"
   *       - in: query
   *         name: page
   *         required: false
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number (1-indexed)
   *       - in: query
   *         name: limit
   *         required: false
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Maximum number of records per page (max 500)
   *     responses:
   *       200:
   *         description: Paginated city list retrieved successfully
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
   *                   example: "Cities retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/CityDropdownItem'
   *                     total:
   *                       type: integer
   *                       example: 320
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     limit:
   *                       type: integer
   *                       example: 100
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', ctrl.getList);

  // ===========================================================================
  // GET /api/master-contacts/city/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/city/{id}:
   *   get:
   *     summary: Get a city by ID
   *     description: |
   *       Retrieves a single city record by its 7-character alphanumeric primary key.
   *       Returns the raw `cont_city` row (without joins).
   *     tags:
   *       - Master Contacts / City
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           maxLength: 7
   *         description: 7-character alphanumeric city code
   *         example: "MUM0001"
   *     responses:
   *       200:
   *         description: City retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ContCity'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: City not found
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
   *                       example: "City not found"
   */
  router.get('/:id', ctrl.getById);

  // ===========================================================================
  // POST /api/master-contacts/city
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/city:
   *   post:
   *     summary: Create a new city
   *     description: |
   *       Creates a new city record. The `pk_city_id` is user-supplied (must be exactly 7
   *       alphanumeric characters). A duplicate check is performed on the `city` name before
   *       insertion and returns HTTP 409 on conflict.
   *
   *       **Validation rules:**
   *       - `pk_city_id`: required, exactly 7 alphanumeric characters
   *       - `city`: required, 1–30 characters, trimmed
   *       - `fk_ctry_id`: required, valid positive integer
   *       - `fk_user_id`: required, valid positive integer
   *       - `fk_state_id`: optional, nullable integer
   *       - `std_code`: optional, max 10 characters
   *     tags:
   *       - Master Contacts / City
   *     security:
   *       - bearerAuth: []
   *
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCityRequest'
   *           example:
   *             pk_city_id: "MUM0001"
   *             city: "Mumbai"
   *             fk_state_id: 1
   *             fk_ctry_id: 101
   *             std_code: "022"
   *             fk_user_id: 4
   *     responses:
   *       201:
   *         description: City created successfully
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
   *                   example: "City \"Mumbai\" saved successfully."
   *                 data:
   *                   $ref: '#/components/schemas/ContCity'
   *       400:
   *         description: Validation error — invalid field values
   *       401:
   *         description: Unauthorized
   *       409:
   *         description: Conflict — city name already exists
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
   *                       example: "City \"Mumbai\" already exists."
   *       500:
   *         description: Internal server error
   */
  router.post('/', ctrl.create);

  // ===========================================================================
  // PUT /api/master-contacts/city/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/city/{id}:
   *   put:
   *     summary: Update an existing city
   *     description: |
   *       Performs a partial update on a city record. All fields are optional. A duplicate name
   *       check is performed if `city` is included. The `sync` field is automatically promoted
   *       from `C` to `E` on update. `date_time_stamp` and `last_status` are updated automatically.
   *     tags:
   *       - Master Contacts / City
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: 7-character city code (primary key)
   *         example: "MUM0001"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateCityRequest'
   *           example:
   *             city: "Greater Mumbai"
   *             fk_user_id: 4
   *     responses:
   *       200:
   *         description: City updated successfully
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
   *                   example: "City \"Greater Mumbai\" updated successfully."
   *                 data:
   *                   $ref: '#/components/schemas/ContCity'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: City not found
   *       409:
   *         description: Duplicate city name
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', ctrl.update);

  // ===========================================================================
  // DELETE /api/master-contacts/city/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/city/{id}:
   *   delete:
   *     summary: Delete a city
   *     description: |
   *       Deletes a city record by its 7-character code.
   *
   *       **Guards applied before deletion:**
   *       - Returns `409 Conflict` if the city is referenced by any address record in `cont_address`
   *       - Returns `404 Not Found` if the city code does not exist
   *     tags:
   *       - Master Contacts / City
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: 7-character city code to delete
   *         example: "MUM0001"
   *     responses:
   *       200:
   *         description: City deleted successfully
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
   *                   example: "City \"Mumbai\" deleted successfully."
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden — system-defined city cannot be deleted
   *       404:
   *         description: City not found
   *       409:
   *         description: Conflict — city is referenced by address records
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', ctrl.deleteCity);

  return router;
}
