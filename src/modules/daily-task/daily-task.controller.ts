import type { Request, Response } from 'express';
import { db } from '../../config/db.config.js';
import { salOfficeBoy } from '../../shared/database/schemas/index.js';
import { eq } from 'drizzle-orm';

import {
  createDailyTaskSchema,
  updateDailyTaskSchema,
  dailyTaskQuerySchema,
} from './daily-task.dto.js';
import * as service from './daily-task.service.js';
import type { UpdateDailyTaskDto } from './daily-task.types.js';

interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: {
    id: string | number;
    username?: string;
    role?: string;
    fk_emp_id?: string | number;
  };
}

async function getOfficeBoyIdForUser(reqUser?: any): Promise<number | undefined> {
  if (!reqUser) return undefined;
  const realUserId = reqUser.role === 'sal_employee' ? ((reqUser as any).fk_user_id ?? reqUser.id) : reqUser.id;
  if (!realUserId) return undefined;

  const [ob] = await db
    .select({ pk_ob_id: salOfficeBoy.pk_ob_id })
    .from(salOfficeBoy)
    .where(eq(salOfficeBoy.fk_user_id, Number(realUserId)))
    .limit(1);
  return ob?.pk_ob_id;
}

export async function listDailyTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = dailyTaskQuerySchema.parse(req.query);
    const filters: {
      fk_ob_id?: number;
      status?: 'Pending' | 'Canceled' | 'Finished';
      priority?: 'High' | 'Medium' | 'Low';
      timeframe?: '7days' | '1month' | 'custom';
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {};

    if (validated.page !== undefined) filters.page = validated.page;
    if (validated.limit !== undefined) filters.limit = validated.limit;
    if (validated.priority !== undefined) filters.priority = validated.priority;
    if (validated.timeframe !== undefined) filters.timeframe = validated.timeframe;
    if (validated.startDate !== undefined) filters.startDate = validated.startDate;
    if (validated.endDate !== undefined) filters.endDate = validated.endDate;

    if (validated.fk_ob_id !== undefined) {
      filters.fk_ob_id = typeof validated.fk_ob_id === 'string' ? Number(validated.fk_ob_id) : validated.fk_ob_id;
    } else if (req.user) {
      const obId = await getOfficeBoyIdForUser(req.user);
      if (obId) {
        filters.fk_ob_id = obId;
      } else if (req.user?.fk_emp_id) {
        filters.fk_ob_id = Number(req.user.fk_emp_id);
      }
    }
    if (validated.status) {
      filters.status = validated.status;
    }
    const result = await service.getDailyTasks(filters);

    res.build
      .withStatus(200)
      .withMessage('Daily tasks retrieved successfully')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(400).withError('LIST_FAILED', error.message).fail().send();
  }
}

export async function getDailyTask(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.build.withStatus(400).withError('INVALID_ID', 'Invalid task ID').fail().send();
      return;
    }

    const result = await service.getDailyTaskById(id);
    if (!result) {
      res.build.withStatus(404).withError('NOT_FOUND', 'Daily task not found').fail().send();
      return;
    }

    res.build
      .withStatus(200)
      .withMessage('Daily task retrieved successfully')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('GET_FAILED', error.message).fail().send();
  }
}

export async function createDailyTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const bodyToValidate = { ...req.body };
    if (!bodyToValidate.fk_ob_id && req.user) {
      const obId = await getOfficeBoyIdForUser(req.user);
      if (obId) {
        bodyToValidate.fk_ob_id = obId;
      } else if (req.user?.fk_emp_id) {
        bodyToValidate.fk_ob_id = typeof req.user.fk_emp_id === 'string' ? Number(req.user.fk_emp_id) : req.user.fk_emp_id;
      }
    } else if (bodyToValidate.fk_ob_id) {
      bodyToValidate.fk_ob_id = typeof bodyToValidate.fk_ob_id === 'string' ? Number(bodyToValidate.fk_ob_id) : bodyToValidate.fk_ob_id;
    }

    const validated = createDailyTaskSchema.parse(bodyToValidate);
    const result = await service.createDailyTask(validated);

    res.build
      .withStatus(201)
      .withMessage('Daily task created successfully')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(400).withError('CREATE_FAILED', error.message).fail().send();
  }
}

export async function updateDailyTask(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.build.withStatus(400).withError('INVALID_ID', 'Invalid task ID').fail().send();
      return;
    }

    const validated = updateDailyTaskSchema.parse(req.body);
    // Filter out undefined values for exactOptionalPropertyTypes
    const updatePayload: UpdateDailyTaskDto = {};
    if (validated.task !== undefined) updatePayload.task = validated.task;
    if (validated.task_date !== undefined) updatePayload.task_date = validated.task_date;
    if (validated.task_time !== undefined) updatePayload.task_time = validated.task_time;
    if (validated.status !== undefined) updatePayload.status = validated.status;
    if (validated.fk_ob_id !== undefined) {
      updatePayload.fk_ob_id = typeof validated.fk_ob_id === 'string' ? Number(validated.fk_ob_id) : validated.fk_ob_id;
    }
    if (validated.remarks !== undefined) updatePayload.remarks = validated.remarks;
    
    const result = await service.updateDailyTask(id, updatePayload);

    if (!result) {
      res.build.withStatus(404).withError('NOT_FOUND', 'Daily task not found').fail().send();
      return;
    }

    res.build
      .withStatus(200)
      .withMessage('Daily task updated successfully')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(400).withError('UPDATE_FAILED', error.message).fail().send();
  }
}

export async function deleteDailyTask(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.build.withStatus(400).withError('INVALID_ID', 'Invalid task ID').fail().send();
      return;
    }

    const result = await service.deleteDailyTask(id);

    if (!result) {
      res.build.withStatus(404).withError('NOT_FOUND', 'Daily task not found').fail().send();
      return;
    }

    res.build
      .withStatus(200)
      .withMessage('Daily task deleted successfully')
      .withData({ deleted: true })
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('DELETE_FAILED', error.message).fail().send();
  }
}
