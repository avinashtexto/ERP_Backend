import { z } from 'zod';

// ─── Create DTO ───────────────────────────────────────────────────────────────

export const createRegionDto = z.object({
  region: z.string().trim().min(1).max(30),
  rate1: z.union([z.number(), z.string()]),
  rate2: z.union([z.number(), z.string()]),
  fk_user_id: z.coerce.number().int({ message: 'fk_user_id must be an integer' }),
});

export type CreateRegionDto = z.infer<typeof createRegionDto>;

// ─── Update DTO ───────────────────────────────────────────────────────────────

export const updateRegionDto = z.object({
  region: z.string().trim().min(1).max(30).optional(),
  rate1: z.union([z.number(), z.string()]).optional(),
  rate2: z.union([z.number(), z.string()]).optional(),
  fk_user_id: z.coerce.number().int().optional(),
});

export type UpdateRegionDto = z.infer<typeof updateRegionDto>;

// ─── List / Filter DTO ────────────────────────────────────────────────────────

export const listRegionDto = z.object({
  region: z.string().trim().optional(),
  last_status: z.string().trim().optional(),
  username: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(200).default(50),
});

export type ListRegionDto = z.infer<typeof listRegionDto>;

// ─── Param DTO ────────────────────────────────────────────────────────────────

export const regionIdParamDto = z.object({
  id: z.coerce.number().int({ message: 'Region ID must be an integer' }),
});

export type RegionIdParamDto = z.infer<typeof regionIdParamDto>;
