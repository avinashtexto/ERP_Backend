import { eq, and, desc, sql, gte, lte, ilike } from 'drizzle-orm';
import { salOfficeBoyTask } from '@/shared/database/schemas/index.js';
import type { DailyTask, CreateDailyTaskDto, UpdateDailyTaskDto } from './daily-task.types.js';
import { db } from '@/config/db.config.js';

export async function getDailyTasks(filters: {
  fk_ob_id?: number;
  status?: 'Pending' | 'Canceled' | 'Finished';
  priority?: 'High' | 'Medium' | 'Low';
  timeframe?: '7days' | '1month' | 'custom';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: DailyTask[]; total: number }> {
  const { fk_ob_id, status, priority, timeframe, startDate, endDate, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (fk_ob_id) {
    conditions.push(eq(salOfficeBoyTask.fk_ob_id, fk_ob_id));
  }
  if (status) {
    conditions.push(eq(salOfficeBoyTask.status, status));
  }
  if (priority) {
    conditions.push(ilike(salOfficeBoyTask.priority, priority));
  }

  // Handle timeframe
  const now = new Date();
  if (timeframe === '7days') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    conditions.push(gte(salOfficeBoyTask.task_date, sevenDaysAgo));
  } else if (timeframe === '1month') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    conditions.push(gte(salOfficeBoyTask.task_date, oneMonthAgo));
  } else if (timeframe === 'custom') {
    if (startDate) {
      conditions.push(gte(salOfficeBoyTask.task_date, new Date(startDate)));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(salOfficeBoyTask.task_date, end));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(salOfficeBoyTask)
        .where(whereClause)
        .orderBy(desc(salOfficeBoyTask.task_date))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(salOfficeBoyTask)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count || 0);

    // Cast status and priority to literal types and ensure all required fields
    const typedData = data.map(row => ({
      pk_obt_id: row.pk_obt_id!,
      task: row.task!,
      task_date: row.task_date!,
      task_time: row.task_time!,
      remarks: row.remarks,
      status: row.status as 'Pending' | 'Canceled' | 'Finished',
      priority: (() => {
        const p = String(row.priority || 'Medium').toLowerCase();
        if (p === 'high') return 'High' as const;
        if (p === 'low') return 'Low' as const;
        return 'Medium' as const;
      })(),
      fk_ob_id: row.fk_ob_id!,
    }));

    return { data: typedData, total };
  } catch (error: any) {
    // If table doesn't exist, return empty result
    if (error.message && error.message.includes('sal_office_boy_task')) {
      console.warn('sal_office_boy_task table not found, returning empty result');
      return { data: [], total: 0 };
    }
    throw error;
  }
}

export async function getDailyTaskById(id: number): Promise<DailyTask | null> {
  const result = await db
    .select()
    .from(salOfficeBoyTask)
    .where(eq(salOfficeBoyTask.pk_obt_id, id))
    .limit(1);

  if (!result[0]) return null;

  const task: DailyTask = {
    pk_obt_id: result[0].pk_obt_id,
    task: result[0].task,
    task_date: result[0].task_date,
    task_time: result[0].task_time,
    remarks: result[0].remarks,
    status: result[0].status as 'Pending' | 'Canceled' | 'Finished',
    priority: (result[0].priority as 'High' | 'Medium' | 'Low') || 'Medium',
    fk_ob_id: result[0].fk_ob_id!,
  };

  return task;
}

export async function createDailyTask(dto: CreateDailyTaskDto): Promise<DailyTask> {
  try {
    const [result] = await db
      .insert(salOfficeBoyTask)
      .values({
        task: dto.task,
        task_date: dto.task_date,
        task_time: dto.task_time,
        status: dto.status,
        priority: dto.priority || 'Medium',
        fk_ob_id: dto.fk_ob_id,
        remarks: dto.remarks,
      })
      .returning();

    if (!result) {
      throw new Error('Failed to create daily task');
    }

    const task: DailyTask = {
      pk_obt_id: result.pk_obt_id,
      task: result.task!,
      task_date: result.task_date!,
      task_time: result.task_time!,
      remarks: result.remarks,
      status: result.status as 'Pending' | 'Canceled' | 'Finished',
      priority: (() => {
        const p = String(result.priority || 'Medium').toLowerCase();
        if (p === 'high') return 'High' as const;
        if (p === 'low') return 'Low' as const;
        return 'Medium' as const;
      })(),
      fk_ob_id: result.fk_ob_id!,
    };

    return task;
  } catch (error: any) {
    if (error.message && error.message.includes('sal_office_boy_task')) {
      throw new Error('sal_office_boy_task table not found in database');
    }
    throw error;
  }
}

export async function updateDailyTask(id: number, dto: UpdateDailyTaskDto): Promise<DailyTask | null> {
  try {
    const [result] = await db
      .update(salOfficeBoyTask)
      .set(dto)
      .where(eq(salOfficeBoyTask.pk_obt_id, id))
      .returning();

    if (!result) return null;

    const task: DailyTask = {
      pk_obt_id: result.pk_obt_id,
      task: result.task!,
      task_date: result.task_date!,
      task_time: result.task_time!,
      remarks: result.remarks,
      status: result.status as 'Pending' | 'Canceled' | 'Finished',
      priority: (() => {
        const p = String(result.priority || 'Medium').toLowerCase();
        if (p === 'high') return 'High' as const;
        if (p === 'low') return 'Low' as const;
        return 'Medium' as const;
      })(),
      fk_ob_id: result.fk_ob_id!,
    };

    return task;
  } catch (error: any) {
    if (error.message && error.message.includes('sal_office_boy_task')) {
      console.warn('sal_office_boy_task table not found, returning null');
      return null;
    }
    throw error;
  }
}

export async function deleteDailyTask(id: number): Promise<boolean> {
  try {
    const result = await db
      .delete(salOfficeBoyTask)
      .where(eq(salOfficeBoyTask.pk_obt_id, id))
      .returning();

    return result.length > 0;
  } catch (error: any) {
    if (error.message && error.message.includes('sal_office_boy_task')) {
      console.warn('sal_office_boy_task table not found, returning false');
      return false;
    }
    throw error;
  }
}
