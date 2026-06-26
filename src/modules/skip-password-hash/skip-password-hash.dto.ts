/**
 * skip-password-hash.dto.ts
 * Zod validation schemas for skip password hash module
 */

import { z } from 'zod';

export const createSkipPasswordHashUserSchema = z.object({
  username: z.string().min(1, 'Username is required').max(255),
});

export const updateSkipPasswordHashUserSchema = z.object({
  username: z.string().min(1).max(255).optional(),
  is_active: z.boolean().optional(),
});

export const skipPasswordHashUserIdSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});
