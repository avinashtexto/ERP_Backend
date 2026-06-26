// ─── sal_nature_of_work.dto.ts ────────────────────────────────────────────────
import { z } from 'zod';

// ── Create ────────────────────────────────────────────────────────────────────
export const createNatureOfWorkSchema = z.object({
  nature_of_work: z
    .string()
    .min(1, 'Nature of Work is required.')
    .max(40, 'Nature of Work must not exceed 40 characters.'),
  fk_user_id: z.number().int('User ID must be an integer.'),
});

// ── Update ────────────────────────────────────────────────────────────────────
export const updateNatureOfWorkSchema = z.object({
  pk_nw_id: z.number().int('Record ID must be an integer.'),
  nature_of_work: z
    .string()
    .min(1, 'Nature of Work is required.')
    .max(40, 'Nature of Work must not exceed 40 characters.'),
  fk_user_id: z.number().int('User ID must be an integer.'),
});

// ── Delete ────────────────────────────────────────────────────────────────────
export const deleteNatureOfWorkSchema = z.object({
  pk_nw_id: z.number().int('Record ID must be an integer.'),
});

// ── List filter ───────────────────────────────────────────────────────────────
export const listNatureOfWorkSchema = z.object({
  nature_of_work: z.string().optional(),
  username: z.string().optional(),
  last_status: z.string().optional(),
  date_timestamp: z.string().optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────────
export type CreateNatureOfWorkInput = z.infer<typeof createNatureOfWorkSchema>;
export type UpdateNatureOfWorkInput = z.infer<typeof updateNatureOfWorkSchema>;
export type DeleteNatureOfWorkInput = z.infer<typeof deleteNatureOfWorkSchema>;
export type ListNatureOfWorkInput = z.infer<typeof listNatureOfWorkSchema>;
