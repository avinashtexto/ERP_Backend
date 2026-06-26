import { z } from 'zod';

// ─────────────────────────────────────────────
// title.dto.ts  –  Zod validation schemas
// ─────────────────────────────────────────────

export const createTitleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(15, 'Title must be at most 15 characters')
    .transform((v) => v.trim()),
  fk_user_id: z.number().int().positive('User ID is required'),
});

export const updateTitleSchema = createTitleSchema.partial();

export const titleQuerySchema = z.object({
  search: z.string().optional(),
  last_status: z.string().optional(),
});

export type CreateTitleInput = z.infer<typeof createTitleSchema>;
export type UpdateTitleInput = z.infer<typeof updateTitleSchema>;
export type TitleQueryInput = z.infer<typeof titleQuerySchema>;
