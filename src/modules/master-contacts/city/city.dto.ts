import { z } from 'zod';

// ─────────────────────────────────────────────
// city.dto.ts  –  Zod validation schemas
// ─────────────────────────────────────────────

export const createCitySchema = z.object({
  city: z
    .string()
    .min(1, 'City name is required')
    .max(30, 'City name must be at most 30 characters')
    .trim(),

  fk_state_id: z
    .number()
    .int()
    .positive('State ID must be positive')
    .nullable()
    .optional()
    .default(null),

  fk_ctry_id: z.number().int().positive('Country is required'),

  std_code: z.string().max(10, 'STD code must be at most 10 characters').default(''),

  fk_user_id: z.number().int().positive('User ID is required'),
});

export const updateCitySchema = z.object({
  city: z.string().min(1).max(30).trim().optional(),

  fk_state_id: z.number().int().positive().nullable().optional(),

  fk_ctry_id: z.number().int().positive().optional(),

  std_code: z.string().max(10).optional(),

  fk_user_id: z.number().int().positive().optional(),
});

export const cityFilterSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export type CreateCityInput = z.infer<typeof createCitySchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
export type CityFilterInput = z.infer<typeof cityFilterSchema>;
