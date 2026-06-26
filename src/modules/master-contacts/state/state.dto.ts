import { z } from 'zod';

// ─── Create DTO ───────────────────────────────────────────────────────────────

export const createStateDto = z.object({
  state: z.string().trim().min(1).max(30),
  fk_ctry_id: z.coerce.number().int({ message: 'fk_ctry_id must be an integer' }),
  state_code: z.string().trim().max(10).default(''),
  fk_user_id: z.coerce.number().int({ message: 'fk_user_id must be an integer' }),
});

export type CreateStateDto = z.infer<typeof createStateDto>;

// ─── Update DTO ───────────────────────────────────────────────────────────────

export const updateStateDto = z.object({
  state: z.string().trim().min(1).max(30).optional(),
  fk_ctry_id: z.coerce.number().int().optional(),
  state_code: z.string().trim().max(10).optional(),
  fk_user_id: z.coerce.number().int().optional(),
});

export type UpdateStateDto = z.infer<typeof updateStateDto>;

// ─── List / Filter DTO ────────────────────────────────────────────────────────

export const listStateDto = z.object({
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  state_code: z.string().trim().optional(),
  last_status: z.string().trim().optional(),
  username: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(200).default(50),
});

export type ListStateDto = z.infer<typeof listStateDto>;

// ─── Param DTO ────────────────────────────────────────────────────────────────

export const stateIdParamDto = z.object({
  id: z.coerce.number().int({ message: 'State ID must be an integer' }),
});

export type StateIdParamDto = z.infer<typeof stateIdParamDto>;
