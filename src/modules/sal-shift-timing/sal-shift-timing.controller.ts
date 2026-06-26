import type { Request, Response } from 'express';
import * as service from './sal-shift-timing.service.js';
import { createShiftTimingSchema, updateShiftTimingSchema, shiftTimingQuerySchema } from './sal-shift-timing.dto.js';
import type { ShiftTimingInput, ShiftTimingUpdate } from './sal-shift-timing.types.js';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const validated = createShiftTimingSchema.parse(req.body);
    const input: ShiftTimingInput = {
      shift: validated.shift,
      s_work: toDate(validated.s_work),
      e_work: toDate(validated.e_work),
      t_work: validated.t_work,
      s_break: toDate(validated.s_break),
      e_break: toDate(validated.e_break),
      t_break: validated.t_break,
      sd: validated.sd,
      date_time_stamp: toDate(validated.date_time_stamp),
      fk_user_id: validated.fk_user_id,
      last_status: validated.last_status,
    };
    const result = await service.createShiftTiming(input);
    res.build.withStatus(201).withMessage('Shift timing created successfully').withData(result).success().send();
  } catch (error: any) {
    res.build.withStatus(400).withError('CREATE_FAILED', error.message).fail().send();
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const result = await service.getShiftTimingById(id);
    if (!result) {
      res.build.withStatus(404).withError('NOT_FOUND', 'Shift timing not found').fail().send();
      return;
    }
    res.build.withStatus(200).withMessage('Shift timing retrieved successfully').withData(result).success().send();
  } catch (error: any) {
    res.build.withStatus(400).withError('RETRIEVE_FAILED', error.message).fail().send();
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const validated = shiftTimingQuerySchema.parse(req.query);
    const filters: any = {};
    if (validated.shift) filters.shift = validated.shift;
    if (validated.last_status) filters.last_status = validated.last_status;
    const result = await service.getAllShiftTimings(filters);
    res.build.withStatus(200).withMessage('Shift timings retrieved successfully').withData(result).success().send();
  } catch (error: any) {
    res.build.withStatus(400).withError('RETRIEVE_FAILED', error.message).fail().send();
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const validated = updateShiftTimingSchema.parse(req.body);
    const update: ShiftTimingUpdate = {};
    if (validated.shift !== undefined) update.shift = validated.shift;
    if (validated.s_work !== undefined) update.s_work = toDate(validated.s_work);
    if (validated.e_work !== undefined) update.e_work = toDate(validated.e_work);
    if (validated.t_work !== undefined) update.t_work = validated.t_work;
    if (validated.s_break !== undefined) update.s_break = toDate(validated.s_break);
    if (validated.e_break !== undefined) update.e_break = toDate(validated.e_break);
    if (validated.t_break !== undefined) update.t_break = validated.t_break;
    if (validated.sd !== undefined) update.sd = validated.sd;
    if (validated.date_time_stamp !== undefined) update.date_time_stamp = toDate(validated.date_time_stamp);
    if (validated.fk_user_id !== undefined) update.fk_user_id = validated.fk_user_id;
    if (validated.last_status !== undefined) update.last_status = validated.last_status;
    const result = await service.updateShiftTiming(id, update);
    if (!result) {
      res.build.withStatus(404).withError('NOT_FOUND', 'Shift timing not found').fail().send();
      return;
    }
    res.build.withStatus(200).withMessage('Shift timing updated successfully').withData(result).success().send();
  } catch (error: any) {
    res.build.withStatus(400).withError('UPDATE_FAILED', error.message).fail().send();
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const result = await service.deleteShiftTiming(id);
    if (!result) {
      res.build.withStatus(404).withError('NOT_FOUND', 'Shift timing not found').fail().send();
      return;
    }
    res.build.withStatus(200).withMessage('Shift timing deleted successfully').withData(result).success().send();
  } catch (error: any) {
    res.build.withStatus(400).withError('DELETE_FAILED', error.message).fail().send();
  }
}
