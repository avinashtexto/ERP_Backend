/**
 * skip-password-hash.routes.ts
 * Route definitions for skip password hash module
 */

import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import * as controller from './skip-password-hash.controller.js';

const router = Router();

/**
 * @openapi
 * /api/skip-password-hash:
 *   get:
 *     summary: Get all users that skip password hashing
 *     tags: [SkipPasswordHash]
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       500:
 *         description: Internal server error
 */
router.get('/', asyncHandler(controller.getAll));

/**
 * @openapi
 * /api/skip-password-hash/{id}:
 *   get:
 *     summary: Get a specific user by ID
 *     tags: [SkipPasswordHash]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', asyncHandler(controller.getById));

/**
 * @openapi
 * /api/skip-password-hash:
 *   post:
 *     summary: Create a new user that skips password hashing
 *     tags: [SkipPasswordHash]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: abhi
 *     responses:
 *       201:
 *         description: Successfully created user
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', asyncHandler(controller.create));

/**
 * @openapi
 * /api/skip-password-hash/{id}:
 *   put:
 *     summary: Update a user that skips password hashing
 *     tags: [SkipPasswordHash]
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
 *               username:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated user
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', asyncHandler(controller.update));

/**
 * @openapi
 * /api/skip-password-hash/{id}:
 *   delete:
 *     summary: Delete a user that skips password hashing
 *     tags: [SkipPasswordHash]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', asyncHandler(controller.remove));

export default router;
