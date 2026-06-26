import { Router } from 'express';

import * as controller from './miscellaneous.controller.js';

const router = Router();

/**
 * @openapi
 * /api/miscellaneous/genders:
 *   get:
 *     summary: Retrieve hardcoded list of genders
 *     tags:
 *       - Miscellaneous
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/genders', controller.getGenders);

/**
 * @openapi
 * /api/miscellaneous/marital-statuses:
 *   get:
 *     summary: Retrieve hardcoded list of marital statuses
 *     tags:
 *       - Miscellaneous
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/marital-statuses', controller.getMaritalStatuses);

export default router;
