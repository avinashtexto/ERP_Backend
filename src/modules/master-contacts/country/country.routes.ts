import { Router } from 'express';

import * as controller from './country.controller.js';

// ─────────────────────────────────────────────
// country.routes.ts
// Tag: Master Contacts / Country
// ─────────────────────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     ContCountry:
 *       type: object
 *       description: A country record containing dialing prefixes and names
 *       properties:
 *         pk_ctry_id:
 *           type: integer
 *           description: Unique country identifier
 *           example: 217
 *         country:
 *           type: string
 *           maxLength: 40
 *           description: Name of the country
 *           example: "India"
 *         isd_code:
 *           type: string
 *           maxLength: 6
 *           description: International ISD dialing code prefix
 *           example: "0091"
 */

export function countryRouter(): Router {
  const router = Router();

  /**
   * @openapi
   * /api/master-contacts/country/dropdown:
   *   get:
   *     summary: Get country dropdown list
   *     description: Returns a complete list of countries sorted by name for populating dropdown selections
   *     tags:
   *       - Master Contacts / Country
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Country dropdown list retrieved successfully
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
   *                   example: "Country dropdown retrieved successfully"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ContCountry'
   *                 module:
   *                   type: string
   *                   example: "country"
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.get('/dropdown', controller.getDropdown);

  return router;
}
