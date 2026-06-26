import { z } from 'zod';

export const individualIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type IndividualIdParam = z.infer<typeof individualIdParamSchema>;

export const createIndividualBodySchema = z.object({
  pk_ind_id: z.number().int().positive().optional(),
  fk_com_id: z.number().int().positive().optional(),
  fk_tit_id: z.number().int().positive().nullable().optional(),
  first_name: z.string().trim().min(1).max(50),
  middle_name: z.string().trim().max(40).default(''),
  surname: z.string().trim().min(1).max(25),
  dob: z.coerce
    .date()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const today = new Date();
        let age = today.getFullYear() - val.getFullYear();
        const m = today.getMonth() - val.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < val.getDate())) {
          age--;
        }
        return age >= 18;
      },
      { message: 'Individual must be at least 18 years old' },
    ),
  photo_url: z.string().trim().max(500).nullable().optional(),
  photo: z.string().trim().max(500).nullable().optional(),
  fk_qual_id: z.number().int().positive().nullable().optional(),
  gender: z.string().trim().max(25).optional().default(''),
  marital_status: z.string().trim().max(25).optional().default('single'),
  fk_org_id: z.number().int().positive().nullable().optional(),
  fk_dep_id: z.number().int().positive().nullable().optional(),
  fk_deg_id: z.number().int().positive().nullable().optional(),
  fk_spo_id: z.number().int().positive().nullable().optional(),
  anniversary: z.coerce.date().nullable().optional(),
  ext: z.string().trim().max(10).nullable().optional(),
  address: z.string().trim().max(150).nullable().optional(),
  fk_city_id: z.number().int().positive().nullable().optional(),
  region: z.string().trim().max(50).nullable().optional(),
  pincode: z.string().trim().max(50).nullable().optional(),
  postfix: z.string().trim().max(25).nullable().optional(),
});

export type CreateIndividualBody = z.infer<typeof createIndividualBodySchema>;

export const updateIndividualBodySchema = createIndividualBodySchema
  .omit({ pk_ind_id: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateIndividualBody = z.infer<typeof updateIndividualBodySchema>;

export const listIndividualQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  fk_org_id: z.coerce.number().int().positive().optional(),
  fk_dep_id: z.coerce.number().int().positive().optional(),
  fk_deg_id: z.coerce.number().int().positive().optional(),
  fk_qual_id: z.coerce.number().int().positive().optional(),
  gender: z.string().trim().max(25).optional(),
  marital_status: z.string().trim().max(25).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(50),
});

export type ListIndividualQuery = z.infer<typeof listIndividualQuerySchema>;
