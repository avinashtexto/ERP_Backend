import { Router } from 'express';

import * as controller from './area-region-shipping-location.controller.js';

const router = Router();

/**
 * @openapi
 * /api/master-contacts/area-region-shipping-location/health:
 *   get:
 *     summary: Retrieve health status for area-region-shipping-location
 *     tags:
 *       - AreaRegionShippingLocation
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
router.get('/health', controller.health);

export default router;
