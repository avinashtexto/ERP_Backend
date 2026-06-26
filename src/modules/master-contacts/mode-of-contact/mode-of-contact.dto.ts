import { z } from 'zod';

// ─── Create DTO ───────────────────────────────────────────────────────────────

export const createModeOfContactDto = z.object({
  moc: z.string().trim().min(1).max(25),
  fk_mt_id: z.coerce.number().int({ message: 'fk_mt_id must be an integer' }),
  fk_user_id: z.coerce.number().int({ message: 'fk_user_id must be an integer' }),
});

export type CreateModeOfContactDto = z.infer<typeof createModeOfContactDto>;

// ─── Update DTO ───────────────────────────────────────────────────────────────

export const updateModeOfContactDto = z.object({
  moc: z.string().trim().min(1).max(25).optional(),
  fk_mt_id: z.coerce.number().int().optional(),
  fk_user_id: z.coerce.number().int().optional(),
});

export type UpdateModeOfContactDto = z.infer<typeof updateModeOfContactDto>;

// ─── List / Filter DTO ────────────────────────────────────────────────────────

export const listModeOfContactDto = z.object({
  moc: z.string().trim().optional(),
  mode: z.string().trim().optional(),
  last_status: z.string().trim().optional(),
  username: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(200).default(50),
});

export type ListModeOfContactDto = z.infer<typeof listModeOfContactDto>;

// ─── Param DTO ────────────────────────────────────────────────────────────────

export const modeOfContactIdParamDto = z.object({
  id: z.coerce.number().int({ message: 'Mode of Contact ID must be an integer' }),
});

export type ModeOfContactIdParamDto = z.infer<typeof modeOfContactIdParamDto>;
