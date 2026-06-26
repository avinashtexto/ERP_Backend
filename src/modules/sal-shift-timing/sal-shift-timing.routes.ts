import { Router } from 'express';
import * as controller from './sal-shift-timing.controller.js';

const router = Router();

/**
 * @openapi
 * /api/sal-shift-timing:
 *   get:
 *     summary: Retrieve all shift timings
 *     tags:
 *       - Shift Timing
 *     parameters:
 *       - in: query
 *         name: shift
 *         schema:
 *           type: string
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 */
router.get('/', controller.getAll);

/**
 * @openapi
 * /api/sal-shift-timing/{id}:
 *   get:
 *     summary: Retrieve shift timing by ID
 *     tags:
 *       - Shift Timing
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /api/sal-shift-timing:
 *   post:
 *     summary: Create new shift timing
 *     tags:
 *       - Shift Timing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift:
 *                 type: string
 *               s_work:
 *                 type: string
 *                 format: date-time
 *               e_work:
 *                 type: string
 *                 format: date-time
 *               t_work:
 *                 type: number
 *               s_break:
 *                 type: string
 *                 format: date-time
 *               e_break:
 *                 type: string
 *                 format: date-time
 *               t_break:
 *                 type: number
 *               sd:
 *                 type: boolean
 *               date_time_stamp:
 *                 type: string
 *                 format: date-time
 *               fk_user_id:
 *                 type: string
 *                 length: 5
 *               last_status:
 *                 type: string
 *                 length: 10
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 */
router.post('/', controller.create);

/**
 * @openapi
 * /api/sal-shift-timing/{id}:
 *   put:
 *     summary: Update shift timing
 *     tags:
 *       - Shift Timing
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift:
 *                 type: string
 *               s_work:
 *                 type: string
 *                 format: date-time
 *               e_work:
 *                 type: string
 *                 format: date-time
 *               t_work:
 *                 type: number
 *               s_break:
 *                 type: string
 *                 format: date-time
 *               e_break:
 *                 type: string
 *                 format: date-time
 *               t_break:
 *                 type: number
 *               sd:
 *                 type: boolean
 *               date_time_stamp:
 *                 type: string
 *                 format: date-time
 *               fk_user_id:
 *                 type: string
 *                 length: 5
 *               last_status:
 *                 type: string
 *                 length: 10
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not Found
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /api/sal-shift-timing/{id}:
 *   delete:
 *     summary: Delete shift timing
 *     tags:
 *       - Shift Timing
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not Found
 */
router.delete('/:id', controller.remove);

export default router;
