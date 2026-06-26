import { z } from 'zod';

const optionalDate = z.coerce.date().nullable().optional();

const dobSchema = z.coerce
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
  );

export const createIndividualSchema = z.object({
  pk_ind_id: z.number().int().positive().optional(),
  fk_com_id: z.number().int().positive('Contact ID is required'),
  fk_tit_id: z.number().int().positive().nullable().optional(),
  first_name: z.string().trim().min(1, 'First name is required').max(50),
  middle_name: z.string().trim().max(40).default(''),
  surname: z.string().trim().min(1, 'Surname is required').max(25),
  dob: dobSchema,
  photo_url: z.string().trim().max(500).nullable().optional(),
  fk_qual_id: z.number().int().positive().nullable().optional(),
  gender: z.string().trim().max(25).optional(),
  marital_status: z.string().trim().max(25).optional(),
  fk_org_id: z.number().int().positive().nullable().optional(),
  fk_dep_id: z.number().int().positive().nullable().optional(),
  fk_deg_id: z.number().int().positive().nullable().optional(),
  fk_spo_id: z.number().int().positive().nullable().optional(),
  anniversary: optionalDate,
  ext: z.string().trim().max(10).nullable().optional(),
});

export type CreateIndividualDto = z.infer<typeof createIndividualSchema>;

export const updateIndividualSchema = createIndividualSchema.omit({ pk_ind_id: true }).partial();

export type UpdateIndividualDto = z.infer<typeof updateIndividualSchema>;

export const filterIndividualSchema = z.object({
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

export type FilterIndividualDto = z.infer<typeof filterIndividualSchema>;

export interface IndividualView {
  pk_ind_id: number;
  fk_com_id: number;
  contact_name: string;
  fk_tit_id: number | null;
  title_name: string | null;
  first_name: string;
  middle_name: string;
  surname: string;
  full_name: string;
  dob: Date | null;
  photo_url: string | null;
  fk_qual_id: number | null;
  qualification_name: string | null;
  gender: string;
  marital_status: string;
  fk_org_id: number | null;
  organisation_name: string | null;
  fk_dep_id: number | null;
  department_name: string | null;
  fk_deg_id: number | null;
  designation_name: string | null;
  fk_spo_id: number | null;
  spouse_name: string | null;
  anniversary: Date | null;
  ext: string | null;
}

export interface LookupItem {
  value: string | number;
  label: string;
}
