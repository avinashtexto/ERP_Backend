import { z } from 'zod';

const userIdField = z.number().int('User ID must be an integer.');

// --- Skintone Schemas ---
const skintoneColourField = z
  .string()
  .min(1, 'Colour is required')
  .max(25, 'Colour must be at most 25 characters')
  .transform((v) => v.trim());

export const createSalSkintoneSchema = z.object({
  colour: skintoneColourField,
  fk_user_id: userIdField,
});

export type CreateSalSkintoneInput = z.infer<typeof createSalSkintoneSchema>;

export const updateSalSkintoneSchema = createSalSkintoneSchema.partial();

export type UpdateSalSkintoneInput = z.infer<typeof updateSalSkintoneSchema>;

export const salSkintoneQuerySchema = z.object({
  colour: z.string().optional(),
  last_status: z.string().optional(),
});

export type SalSkintoneQueryInput = z.infer<typeof salSkintoneQuerySchema>;

// --- Castes Schemas ---
const castesCasteField = z
  .string()
  .min(1, 'Caste is required')
  .max(40, 'Caste must be at most 40 characters')
  .transform((v) => v.trim());

export const createSalCastesSchema = z.object({
  caste: castesCasteField,
  fk_user_id: userIdField,
});

export type CreateSalCastesInput = z.infer<typeof createSalCastesSchema>;

export const updateSalCastesSchema = createSalCastesSchema.partial();

export type UpdateSalCastesInput = z.infer<typeof updateSalCastesSchema>;

export const salCastesQuerySchema = z.object({
  caste: z.string().optional(),
  last_status: z.string().optional(),
});

export type SalCastesQueryInput = z.infer<typeof salCastesQuerySchema>;

// --- Religion Schemas ---
const religionNameField = z
  .string()
  .min(1, 'Religion name is required')
  .max(50, 'Religion name must be at most 50 characters')
  .transform((v) => v.trim());

export const createSalReligionSchema = z.object({
  religion: religionNameField,
  fk_user_id: userIdField,
});

export type CreateSalReligionInput = z.infer<typeof createSalReligionSchema>;

export const updateSalReligionSchema = createSalReligionSchema.partial();

export type UpdateSalReligionInput = z.infer<typeof updateSalReligionSchema>;

export const salReligionQuerySchema = z.object({
  religion: z.string().optional(),
  last_status: z.string().optional(),
});

export type SalReligionQueryInput = z.infer<typeof salReligionQuerySchema>;

// --- ScheduleType Schemas ---
const scheduleTypeNameField = z
  .string()
  .min(1, 'Schedule type name is required')
  .max(100, 'Schedule type name must be at most 100 characters')
  .transform((v) => v.trim());

export const createSalScheduleTypeSchema = z.object({
  type: scheduleTypeNameField,
  fk_user_id: userIdField,
});

export type CreateSalScheduleTypeInput = z.infer<typeof createSalScheduleTypeSchema>;

export const updateSalScheduleTypeSchema = createSalScheduleTypeSchema.partial();

export type UpdateSalScheduleTypeInput = z.infer<typeof updateSalScheduleTypeSchema>;

export const salScheduleTypeQuerySchema = z.object({
  type: z.string().optional(),
  last_status: z.string().optional(),
});

export type SalScheduleTypeQueryInput = z.infer<typeof salScheduleTypeQuerySchema>;
