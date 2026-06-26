import { z } from 'zod';

export const createShiftTimingSchema = z.object({
  shift: z.string().min(1).max(50),
  s_work: z.string().or(z.date()),
  e_work: z.string().or(z.date()),
  t_work: z.string(),
  s_break: z.string().or(z.date()),
  e_break: z.string().or(z.date()),
  t_break: z.string(),
  sd: z.boolean(),
  date_time_stamp: z.string().or(z.date()),
  fk_user_id: z.string().length(5),
  last_status: z.string().max(10),
});

export const updateShiftTimingSchema = z.object({
  shift: z.string().min(1).max(50).optional(),
  s_work: z.string().or(z.date()).optional(),
  e_work: z.string().or(z.date()).optional(),
  t_work: z.string().optional(),
  s_break: z.string().or(z.date()).optional(),
  e_break: z.string().or(z.date()).optional(),
  t_break: z.string().optional(),
  sd: z.boolean().optional(),
  date_time_stamp: z.string().or(z.date()).optional(),
  fk_user_id: z.string().length(5).optional(),
  last_status: z.string().max(10).optional(),
});

export const shiftTimingQuerySchema = z.object({
  shift: z.string().optional(),
  last_status: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});
