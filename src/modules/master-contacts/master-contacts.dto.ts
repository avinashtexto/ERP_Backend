import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared field helpers
// ---------------------------------------------------------------------------

const userIdField = z.number().int().positive('User ID must be a positive integer');

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export const createCategorySchema = z.object({
  pk_cat_id: z.number().int().positive().optional(),
  category: z
    .string()
    .min(1)
    .max(30)
    .transform((v) => v.trim()),
  fk_user_id: userIdField,
});
export const updateCategorySchema = createCategorySchema.omit({ pk_cat_id: true }).partial();
export const categoryQuerySchema = z.object({
  search: z.string().optional(),
  last_status: z.string().optional(),
});
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

// ---------------------------------------------------------------------------
// Department
// ---------------------------------------------------------------------------

export const createDepartmentSchema = z.object({
  pk_dep_id: z.number().int().positive().optional(),
  department: z
    .string()
    .min(1)
    .max(30)
    .transform((v) => v.trim()),
  fk_user_id: userIdField,
});
export const updateDepartmentSchema = createDepartmentSchema.omit({ pk_dep_id: true }).partial();
export const departmentQuerySchema = z.object({
  search: z.string().optional(),
  last_status: z.string().optional(),
});
export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;

// ---------------------------------------------------------------------------
// Designation
// ---------------------------------------------------------------------------

export const createDesignationSchema = z.object({
  pk_des_id: z.number().int().positive().optional(),
  designation: z
    .string()
    .min(1)
    .max(30)
    .transform((v) => v.trim()),
  se: z.boolean().default(false),
  fk_user_id: userIdField,
});
export const updateDesignationSchema = createDesignationSchema.omit({ pk_des_id: true }).partial();
export const designationQuerySchema = z.object({
  search: z.string().optional(),
  last_status: z.string().optional(),
});
export type CreateDesignationDto = z.infer<typeof createDesignationSchema>;
export type UpdateDesignationDto = z.infer<typeof updateDesignationSchema>;

// ---------------------------------------------------------------------------
// Qualification
// ---------------------------------------------------------------------------

export const createQualificationSchema = z.object({
  pk_qua_id: z.number().int().positive().optional(),
  qualification: z
    .string()
    .min(1)
    .max(40)
    .transform((v) => v.trim()),
  fk_user_id: userIdField,
});
export const updateQualificationSchema = createQualificationSchema
  .omit({ pk_qua_id: true })
  .partial();
export const qualificationQuerySchema = z.object({
  search: z.string().optional(),
  last_status: z.string().optional(),
});
export type CreateQualificationDto = z.infer<typeof createQualificationSchema>;
export type UpdateQualificationDto = z.infer<typeof updateQualificationSchema>;

// ---------------------------------------------------------------------------
// Relationship
// ---------------------------------------------------------------------------

export const createRelationshipSchema = z.object({
  pk_rel_id: z.number().int().positive().optional(),
  relationship: z
    .string()
    .min(1)
    .max(30)
    .transform((v) => v.trim()),
  fk_user_id: userIdField,
});
export const updateRelationshipSchema = createRelationshipSchema
  .omit({ pk_rel_id: true })
  .partial();
export const relationshipQuerySchema = z.object({
  search: z.string().optional(),
  last_status: z.string().optional(),
});
export type CreateRelationshipDto = z.infer<typeof createRelationshipSchema>;
export type UpdateRelationshipDto = z.infer<typeof updateRelationshipSchema>;

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

export const createTitleSchema = z.object({
  pk_tit_id: z.number().int().positive().optional(),
  title: z
    .string()
    .min(1)
    .max(15)
    .transform((v) => v.trim()),
  fk_user_id: userIdField,
});
export const updateTitleSchema = createTitleSchema.omit({ pk_tit_id: true }).partial();
export const titleQuerySchema = z.object({
  search: z.string().optional(),
  last_status: z.string().optional(),
});
export type CreateTitleDto = z.infer<typeof createTitleSchema>;
export type UpdateTitleDto = z.infer<typeof updateTitleSchema>;
