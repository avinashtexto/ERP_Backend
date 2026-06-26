import { z } from 'zod';

const groupNameField = z
  .string()
  .min(1, 'Group name is required')
  .max(40, 'Group name must be at most 40 characters')
  .transform((v) => v.trim());

const prefixField = z.string().length(1, 'Prefix must be exactly 1 character');

const dcField = z
  .enum(['DR', 'CR', 'D', 'C'], {
    message: 'DC must be "DR", "CR", "D" or "C"',
  })
  .transform((v) => (v === 'DR' || v === 'D' ? 'D' : 'C'));

const userIdField = z.string().min(1).max(5, 'User ID must be at most 5 characters');

// ---------------------------------------------------------------------------
// Create DTO
// ---------------------------------------------------------------------------

export const createAcctGroupSchema = z.object({
  pk_grp_id: z.number().int().positive().optional(),
  group_name: groupNameField,
  fk_prt_id: z.number().int().positive({ message: 'Parent group is required' }),
  grouping: z.number().int(),
  prefix: prefixField,
  dc: dcField,
  fk_user_id: userIdField,

  // fk_main_id and fk_sub_id are derived in the service from fk_prt_id,
  // but allow callers to override if needed.
  fk_main_id: z.number().int().positive().optional(),
  fk_sub_id: z.number().int().positive().optional(),
});

export type CreateAcctGroupDto = z.infer<typeof createAcctGroupSchema>;

// ---------------------------------------------------------------------------
// Update DTO
// ---------------------------------------------------------------------------

export const updateAcctGroupSchema = createAcctGroupSchema.omit({ pk_grp_id: true }).partial();

export type UpdateAcctGroupDto = z.infer<typeof updateAcctGroupSchema>;

// ---------------------------------------------------------------------------
// Query / filter DTO
// ---------------------------------------------------------------------------

export const acctGroupQuerySchema = z.object({
  group_name: z.string().optional(),
  parent_name: z.string().optional(),
  username: z.string().optional(),
  last_status: z.string().optional(),
  date_time_stamp: z.string().optional(),
});

export type AcctGroupQueryDto = z.infer<typeof acctGroupQuerySchema>;
