/**
 * master-employee.dto.ts
 * Zod validation schemas for master-employee requests.
 * Fields match the database schema column names exactly.
 */

import { z } from 'zod';

const numericStringSchema = z
  .preprocess((val) => {
    if (val === null || val === undefined || val === '') return null;
    return String(val);
  }, z.string().nullable())
  .optional();

export const empContactSchema = z.object({
  fk_moc_id: z.string().max(5),
  contact: z.string().max(50),
  ext: z.string().max(10).default(''),
  sr_no: z.number().int(),
});

export const empDocumentSchema = z.object({
  fk_dt_id: z.number().int(),
  doc_file: z.string().max(100),
  valid_until: z
    .preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return null;
    }, z.date().nullable())
    .optional(),
});

export const createEmployeeSchema = z.object({
  emp_code: z.string().max(30).min(1, 'Employee code is required'),
  fk_tit_id: z.number().int().nullable().optional(),
  employee: z.string().max(50).min(1, 'Employee name is required'),
  doj: z.preprocess((val) => new Date(val as string), z.date()),
  dob: z
    .preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable())
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
          age--;
        }
        return age >= 18;
      },
      { message: 'Employee must be at least 18 years old' },
    ),
  photo: z.string().nullable().optional(),
  fk_qual_id: z.number().int().nullable().optional(),
  gender: z.string().max(10).default('Male'),
  martial_status: z.string().max(15).default('Single'),
  anni: z
    .preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable())
    .optional(),
  p_address: z.string().max(255).min(1, 'Resident address is required'),
  n_address: z.string().max(255).min(1, 'Native address is required'),
  fk_dep_id: z.number().int().nullable().optional(),
  fk_deg_id: z.number().int().nullable().optional(),
  fk_bnk_id: z.number().int().nullable().optional(),
  account_no: z.string().max(20).default(''),
  pf_no: z.string().max(25).default(''),
  esic_no: z.string().max(25).default(''),
  pan_no: z
    .string()
    .max(25)
    .default('')
    .refine(
      (val) => {
        if (!val) return true;
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val);
      },
      { message: 'Invalid PAN card format (e.g. ABCDE1234F)' },
    ),
  dol: z
    .preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable())
    .optional(),
  blood_grp: z.string().max(6).default('O+'),
  wp: z.string().max(50).default('Head Office'),
  aadhar: z
    .string()
    .max(50)
    .default('')
    .refine(
      (val) => {
        if (!val) return true;
        return /^[0-9]{12}$/.test(val);
      },
      { message: 'Aadhar card must be exactly 12 digits' },
    ),
  cv_copy: z.string().max(50).default(''),
  le_copy: z.string().max(50).default(''),
  fk_m_doc_id: z.string().max(20).nullable().optional(),
  username: z.string().max(15).min(1, 'Username is required'),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .max(10, 'Password must not exceed 10 characters'),
  question: z
    .string()
    .max(50, 'Security question must not exceed 50 characters')
    .default('What is your favorite food?'),
  answer: z.string().max(50).min(1, 'Answer is required'),
  ext: z.string().max(10).default(''),
  rtgs: z.string().max(20).default(''),
  s_address: z.string().max(30).default(''),
  sb: z.boolean().default(true),
  type: z.string().max(20).default('Office Staff'),
  att_type: z.boolean().default(true),
  height: numericStringSchema,
  weight: numericStringSchema,
  fk_rg_id: numericStringSchema,
  fk_cs_id: numericStringSchema,
  fk_st_id: numericStringSchema,
  mark: z.string().max(50).default(''),
  experience: z.string().nullable().optional(),
  fk_r_emp_id: numericStringSchema,
  police: z.string().max(50).default(''),
  add_police: z.string().max(255).default(''),
  cont_police: z
    .string()
    .max(25)
    .default('')
    .refine(
      (val) => {
        if (!val) return true;
        return /^\+?[0-9]{10,15}$/.test(val);
      },
      { message: 'Invalid police contact number' },
    ),
  fk_w1_emp_id: numericStringSchema,
  fk_w2_emp_id: numericStringSchema,
  personality1: z.string().max(50).default(''),
  fk_p1_des_id: z.number().int().nullable().optional(),
  p1_address: z.string().max(255).default(''),
  p1_contact: z
    .string()
    .max(25)
    .default('')
    .refine(
      (val) => {
        if (!val) return true;
        return /^\+?[0-9]{10,15}$/.test(val);
      },
      { message: 'Invalid primary reference contact number' },
    ),
  personality2: z.string().max(50).default(''),
  fk_p2_des_id: z.number().int().nullable().optional(),
  p2_address: z.string().max(255).default(''),
  p2_contact: z
    .string()
    .max(25)
    .default('')
    .refine(
      (val) => {
        if (!val) return true;
        return /^\+?[0-9]{10,15}$/.test(val);
      },
      { message: 'Invalid secondary reference contact number' },
    ),
  messaging: z.boolean().default(true),
  fk_acct_id: z.number().int().nullable().optional(),
  geolocation: z.boolean().default(true),
  employment: z.string().max(10).default(''),
  inform_pf: z.boolean().nullable().optional(),
  inform_esic: z.boolean().nullable().optional(),
  contacts: z.array(empContactSchema).default([]),
  documents: z.array(empDocumentSchema).default([]),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
