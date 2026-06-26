// ─── sal-it-section.dto.ts ──────────────────────────────────────────────────
import { z } from 'zod';

export const createSalItSectionSchema = z.object({
  it_section: z
    .string()
    .min(1, 'Income Tax Section is required.')
    .max(75, 'Income Tax Section must not exceed 75 characters.'),
  deduction: z
    .string()
    .min(1, 'Deduction is required.')
    .refine((val) => !isNaN(parseFloat(val)), 'Deduction must be a numeric value.'),
  fk_fy_id: z.number().int('Financial Year ID must be an integer.').nullable().optional(),
  fk_user_id: z.number().int('User ID must be an integer.'),
  additraction: z.enum(['Addition', 'Subtraction'], {
    message: 'Addition/Subtraction dropdown selection is invalid.',
  }),
});

export const updateSalItSectionSchema = z.object({
  pk_sec_id: z.number().int('Record ID must be an integer.'),
  it_section: z
    .string()
    .min(1, 'Income Tax Section is required.')
    .max(75, 'Income Tax Section must not exceed 75 characters.')
    .optional(),
  deduction: z
    .string()
    .min(1, 'Deduction is required.')
    .refine((val) => !isNaN(parseFloat(val)), 'Deduction must be a numeric value.')
    .optional(),
  fk_fy_id: z.number().int('Financial Year ID must be an integer.').nullable().optional(),
  fk_user_id: z.number().int('User ID must be an integer.'),
  additraction: z.enum(['Addition', 'Subtraction']).optional(),
});

export const deleteSalItSectionSchema = z.object({
  pk_sec_id: z.number().int('Record ID must be an integer.'),
});

export const listSalItSectionSchema = z.object({
  it_section: z.string().optional(),
  username: z.string().optional(),
  last_status: z.string().optional(),
  date_timestamp: z.string().optional(),
  additraction: z.string().optional(),
});

export type CreateSalItSectionInput = z.infer<typeof createSalItSectionSchema>;
export type UpdateSalItSectionInput = z.infer<typeof updateSalItSectionSchema>;
export type DeleteSalItSectionInput = z.infer<typeof deleteSalItSectionSchema>;
export type ListSalItSectionInput = z.infer<typeof listSalItSectionSchema>;
