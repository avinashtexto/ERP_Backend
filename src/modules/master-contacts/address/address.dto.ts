import { z } from 'zod';

// ─────────────────────────────────────────────
// address.dto.ts  –  Zod validation schemas
// ─────────────────────────────────────────────

export const createAddressSchema = z.object({
  fk_cont_id: z.number().int().positive('Organization is required'),

  address: z
    .string()
    .min(1, 'Address is required')
    .max(150, 'Address must be at most 150 characters')
    .trim(),

  fk_city_id: z.number().int().positive().nullable().optional().default(null),

  region: z.string().max(50).trim().default(''),

  pincode: z
    .string()
    .max(10)
    .regex(/^\d*$/, 'Pincode must be numeric')
    .nullable()
    .optional()
    .default(null),

  fk_user_id: z.number().int().positive('User ID is required'),
});

export const updateAddressSchema = z.object({
  fk_cont_id: z.number().int().positive().optional(),

  address: z.string().min(1, 'Address cannot be empty').max(150).trim().optional(),

  fk_city_id: z.number().int().positive().nullable().optional(),

  region: z.string().max(50).trim().optional(),

  pincode: z.string().max(10).regex(/^\d*$/, 'Pincode must be numeric').nullable().optional(),

  fk_user_id: z.number().int().positive().optional(),
});

export const addressFilterSchema = z.object({
  contact_name: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  pincode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  username: z.string().optional(),
  last_status: z.string().optional(),
  date_time_stamp: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AddressFilterInput = z.infer<typeof addressFilterSchema>;
