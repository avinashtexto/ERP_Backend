import { z } from 'zod';

export const formRightRowSchema = z.object({
  form_name: z.string(),
  module_name: z.string(),
  module_caption: z.string(),
  module_id: z.coerce.number(),
  form_id: z.coerce.number(),
  add: z.coerce.boolean().default(false),
  edit: z.coerce.boolean().default(false),
  delete: z.coerce.boolean().default(false),
  view: z.coerce.boolean().default(false),
  print: z.coerce.boolean().default(false),
  export: z.coerce.boolean().default(false),
  authorize: z.coerce.boolean().default(false),
});

export const formReportRowSchema = z.object({
  form_name: z.string(),
  module_name: z.string(),
  module_caption: z.string(),
  module_id: z.coerce.number(),
  form_id: z.coerce.number(),
  view: z.coerce.boolean().default(false),
  print: z.coerce.boolean().default(false),
  export: z.coerce.boolean().default(false),
});

export const formOtherRowSchema = z.object({
  form_name: z.string(),
  module_name: z.string(),
  module_caption: z.string(),
  module_id: z.coerce.number(),
  form_id: z.coerce.number(),
  rights: z.coerce.boolean().default(false),
});

export const specialRowSchema = z.object({
  form: z.string(),
  rights: z.coerce.boolean().default(false),
});

export const branchRowSchema = z.object({
  fk_set_id: z.coerce.number(),
});

export const dashboardRowSchema = z.object({
  id: z.coerce.number(),
});

export const processRowSchema = z.object({
  fk_prod_id: z.string(),
});

export const saveUserRightsInSchema = z.object({
  user_id: z.coerce.number(),
  operator_id: z.coerce.number(),
  own_records: z.coerce.boolean().default(false),
  other_records: z.coerce.boolean().default(false),
  masters: z.array(formRightRowSchema).default([]),
  transactions: z.array(formRightRowSchema).default([]),
  reports: z.array(formReportRowSchema).default([]),
  others: z.array(formOtherRowSchema).default([]),
  specials: z.array(specialRowSchema).default([]),
  branches: z.array(branchRowSchema).default([]),
  dashboards: z.array(dashboardRowSchema).default([]),
  processes: z.array(processRowSchema).default([]),
});

export const getUserRightsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const emptyQuerySchema = z.object({}).catchall(z.never()).optional();
export const listUsersQuerySchema = z
  .object({
    search: z.string().optional(),
  })
  .catchall(z.never())
  .optional();

export const createNewFormSchema = z.object({
  form_name: z.string().min(1).max(100),
  category: z.enum(['master', 'transaction', 'report', 'other']),
  prefix: z.string().max(5).optional().nullable(),
  last_id: z.coerce.string().optional().nullable(),
  start_with: z.coerce.string().optional().nullable(),
  len: z.coerce.string().optional().nullable(),
  module_name: z.string().min(1).max(50),
  module_caption: z.string().max(50).optional().nullable(),
  news: z.coerce.boolean().optional().nullable(),
});
