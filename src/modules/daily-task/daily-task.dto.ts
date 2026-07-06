import { z } from 'zod';

const priorityNormalize = z.preprocess(
  val => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if (lower === 'high') return 'High';
      if (lower === 'medium') return 'Medium';
      if (lower === 'low') return 'Low';
    }
    return val;
  },
  z.enum(['High', 'Medium', 'Low'])
);

export const dailyTaskBaseSchema = z.object({
  task: z.string().min(1, 'Task is required').max(500, 'Task too long'),
  task_date: z.coerce.date(),
  task_time: z.coerce.date(),
  remarks: z.string().max(500).optional(),
  status: z.enum(['Pending', 'Canceled', 'Finished']),
  priority: priorityNormalize.default('Medium'),
  fk_ob_id: z.number().min(1, 'Office Boy ID is required'),
});

export const createDailyTaskSchema = dailyTaskBaseSchema;

export const updateDailyTaskSchema = dailyTaskBaseSchema.partial();

export const dailyTaskQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  fk_ob_id: z.coerce.number().optional(),
  status: z.enum(['Pending', 'Canceled', 'Finished']).optional(),
  priority: priorityNormalize.optional(),
  timeframe: z.enum(['7days', '1month', 'custom']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
