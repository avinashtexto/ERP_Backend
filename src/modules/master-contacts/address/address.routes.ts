import { Router } from 'express';

import * as ctrl from './address.controller.js';

// ─────────────────────────────────────────────
// address.routes.ts
// Tag: Master Contacts / Address
// ─────────────────────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     ContAddress:
 *       type: object
 *       description: A physical address record linked to a contact organization
 *       properties:
 *         pk_ca_id:
 *           type: integer
 *           description: Auto-incremented primary key
 *           example: 12
 *         fk_cont_id:
 *           type: integer
 *           nullable: true
 *           description: FK reference to cont_common (the contact organization)
 *           example: 5
 *         address:
 *           type: string
 *           maxLength: 150
 *           description: Street or building address line
 *           example: "123, Marine Drive"
 *         fk_city_id:
 *           type: string
 *           maxLength: 7
 *           nullable: true
 *           description: FK reference to cont_city (7-char city code)
 *           example: "MUM0001"
 *         region:
 *           type: string
 *           maxLength: 50
 *           description: Sub-locality or area/region within the city
 *           example: "Nariman Point"
 *         pincode:
 *           type: string
 *           maxLength: 10
 *           nullable: true
 *           description: Postal / ZIP code (numeric string)
 *           example: "400021"
 *         fk_user_id:
 *           type: integer
 *           description: ID of the user who created or last modified this record
 *           example: 4
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           example: "2026-06-10T12:00:00.000Z"
 *         last_status:
 *           type: string
 *           example: "Added"
 *
 *     AddressListRow:
 *       type: object
 *       description: Enriched address record returned by list and detail endpoints (with joined city/state/country/contact)
 *       properties:
 *         pk_ca_id:
 *           type: integer
 *           example: 12
 *         address:
 *           type: string
 *           example: "123, Marine Drive"
 *         region:
 *           type: string
 *           example: "Nariman Point"
 *         pincode:
 *           type: string
 *           nullable: true
 *           example: "400021"
 *         fk_cont_id:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         contact_name:
 *           type: string
 *           nullable: true
 *           description: Resolved contact organization name (joined from cont_common)
 *           example: "Tionix Technologies Pvt. Ltd."
 *         pk_city_id:
 *           type: string
 *           nullable: true
 *           example: "MUM0001"
 *         city:
 *           type: string
 *           nullable: true
 *           example: "Mumbai"
 *         pk_state_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         state:
 *           type: string
 *           nullable: true
 *           example: "Maharashtra"
 *         pk_ctry_id:
 *           type: integer
 *           nullable: true
 *           example: 101
 *         country:
 *           type: string
 *           nullable: true
 *           example: "India"
 *         fk_user_id:
 *           type: integer
 *           nullable: true
 *           example: 4
 *         username:
 *           type: string
 *           nullable: true
 *           example: "admin"
 *         last_status:
 *           type: string
 *           example: "Added"
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           example: "2026-06-10T12:00:00.000Z"
 *
 *     CreateAddressRequest:
 *       type: object
 *       required: [fk_cont_id, address, fk_user_id]
 *       properties:
 *         fk_cont_id:
 *           type: integer
 *           description: ID of the contact organization this address belongs to
 *           example: 5
 *         address:
 *           type: string
 *           minLength: 1
 *           maxLength: 150
 *           example: "123, Marine Drive"
 *         fk_city_id:
 *           type: string
 *           maxLength: 7
 *           nullable: true
 *           example: "MUM0001"
 *         region:
 *           type: string
 *           maxLength: 50
 *           example: "Nariman Point"
 *         pincode:
 *           type: string
 *           maxLength: 10
 *           nullable: true
 *           example: "400021"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *
 *     UpdateAddressRequest:
 *       type: object
 *       description: All fields are optional — only provided fields are updated
 *       properties:
 *         fk_cont_id:
 *           type: integer
 *           example: 5
 *         address:
 *           type: string
 *           maxLength: 150
 *           example: "456, Linking Road"
 *         fk_city_id:
 *           type: string
 *           maxLength: 7
 *           nullable: true
 *           example: "MUM0001"
 *         region:
 *           type: string
 *           maxLength: 50
 *           example: "Bandra West"
 *         pincode:
 *           type: string
 *           maxLength: 10
 *           nullable: true
 *           example: "400050"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 */

export function addressRouter(): Router {
  const router = Router();

  // ===========================================================================
  // GET /api/master-contacts/address
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/address:
   *   get:
   *     summary: List addresses with pagination and filters
   *     description: |
   *       Returns a paginated list of address records joined with contact, city, state, country,
   *       and user. Supports partial-match filters on all major fields, equivalent to the VB
   *       `FillList()` / `grList` filter functionality.
   *     tags:
   *       - Master Contacts / Address
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: contact_name
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial prefix match on the contact organization name
   *         example: "Tionix"
   *       - in: query
   *         name: address
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial prefix match on the address line
   *         example: "Marine"
   *       - in: query
   *         name: region
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial prefix match on the region/sub-locality
   *         example: "Nariman"
   *       - in: query
   *         name: pincode
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial prefix match on the pincode
   *         example: "4000"
   *       - in: query
   *         name: city
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial prefix match on the resolved city name
   *         example: "Mumbai"
   *       - in: query
   *         name: state
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial prefix match on the resolved state name
   *         example: "Maha"
   *       - in: query
   *         name: country
   *         required: false
   *         schema:
   *           type: string
   *         description: Partial prefix match on the resolved country name
   *         example: "India"
   *       - in: query
   *         name: last_status
   *         required: false
   *         schema:
   *           type: string
   *         description: Filter by audit status (e.g. Added, Edited)
   *         example: "Added"
   *       - in: query
   *         name: date_time_stamp
   *         required: false
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by exact date of last modification (YYYY-MM-DD)
   *         example: "2026-06-10"
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
   *         description: Records per page (max 500)
   *     responses:
   *       200:
   *         description: Address list retrieved successfully
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
   *                   example: "Addresses retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/AddressListRow'
   *                     total:
   *                       type: integer
   *                       example: 48
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
  router.get('/organizations/dropdown', ctrl.getOrganizationsDropdown);

  // ===========================================================================
  // GET /api/master-contacts/address/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/address/{id}:
   *   get:
   *     summary: Get an address by ID
   *     description: |
   *       Retrieves a single address record by its integer primary key, joined with
   *       contact, city, state, country, and user — equivalent to `SelectRecord()` in VB.
   *     tags:
   *       - Master Contacts / Address
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Numeric primary key of the address record
   *         example: 12
   *     responses:
   *       200:
   *         description: Address retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AddressListRow'
   *       400:
   *         description: Bad Request — ID is not a valid integer
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Address not found
   */
  router.get('/:id', ctrl.getById);

  // ===========================================================================
  // POST /api/master-contacts/address
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/address:
   *   post:
   *     summary: Create a new address
   *     description: |
   *       Creates a new address record linked to a contact organization. A duplicate check
   *       is performed — the same address text cannot be saved twice for the same organization.
   *
   *       After creation, the denormalized address string is synced to related transaction tables
   *       (`tran_sal_main`, `tran_si_main`, `tran_oa_main`, `tran_sal_trip`) via the
   *       `ReturnAddress()` formatter equivalent.
   *
   *       **Validation rules:**
   *       - `fk_cont_id`: required, positive integer (contact organization ID)
   *       - `address`: required, 1–150 characters, trimmed
   *       - `fk_user_id`: required, positive integer
   *       - `fk_city_id`: optional, exactly 7 characters if provided
   *       - `region`: optional, max 50 characters
   *       - `pincode`: optional, numeric string, max 10 characters
   *     tags:
   *       - Master Contacts / Address
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateAddressRequest'
   *           example:
   *             fk_cont_id: 5
   *             address: "123, Marine Drive"
   *             fk_city_id: "MUM0001"
   *             region: "Nariman Point"
   *             pincode: "400021"
   *             fk_user_id: 4
   *     responses:
   *       201:
   *         description: Address created successfully
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
   *                   example: "Address saved successfully."
   *                 data:
   *                   $ref: '#/components/schemas/ContAddress'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       409:
   *         description: Duplicate address for this organization
   *       422:
   *         description: Unprocessable Entity — address field is empty after trimming
   *       500:
   *         description: Internal server error
   */
  router.post('/', ctrl.create);

  // ===========================================================================
  // PUT /api/master-contacts/address/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/address/{id}:
   *   put:
   *     summary: Update an existing address
   *     description: |
   *       Performs a partial update on an address record. All fields are optional.
   *       A duplicate check is performed if both `fk_cont_id` and `address` are provided.
   *
   *       After update, the denormalized formatted address string is automatically re-synced
   *       to related transaction tables.
   *
   *       `sync` is automatically promoted from `C` → `E` on edit.
   *     tags:
   *       - Master Contacts / Address
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Numeric primary key of the address to update
   *         example: 12
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateAddressRequest'
   *           example:
   *             address: "456, Linking Road"
   *             region: "Bandra West"
   *             pincode: "400050"
   *             fk_user_id: 4
   *     responses:
   *       200:
   *         description: Address updated successfully
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
   *                   example: "Address updated successfully."
   *                 data:
   *                   $ref: '#/components/schemas/ContAddress'
   *       400:
   *         description: Validation error or invalid ID
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Address not found
   *       409:
   *         description: Duplicate address for the same organization
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', ctrl.update);

  // ===========================================================================
  // DELETE /api/master-contacts/address/:id
  // ===========================================================================

  /**
   * @openapi
   * /api/master-contacts/address/{id}:
   *   delete:
   *     summary: Delete an address
   *     description: |
   *       Deletes an address record by ID.
   *
   *       **Guards applied before deletion:**
   *       - Returns `409 Conflict` if the address is referenced by any transaction records in
   *         `tran_sal_main`, `tran_si_main`, or `tran_oa_main`
   *       - Returns `404 Not Found` if the ID does not exist
   *     tags:
   *       - Master Contacts / Address
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Numeric primary key of the address to delete
   *         example: 12
   *     responses:
   *       200:
   *         description: Address deleted successfully
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
   *                   example: "Address of \"Tionix Technologies Pvt. Ltd.\" deleted successfully."
   *       400:
   *         description: Bad Request — invalid ID
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden — system-defined address cannot be deleted
   *       404:
   *         description: Address not found
   *       409:
   *         description: Conflict — address is referenced by transaction records
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', ctrl.deleteAddress);

  return router;
}
