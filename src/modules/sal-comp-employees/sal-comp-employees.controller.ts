import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  create_complaint_dto,
  update_complaint_dto,
  list_complaints_dto,
} from './sal-comp-employees.dto.js';
import * as service from './sal-comp-employees.service.js';

const MODULE = 'sal-comp-employees';

// GET /api/sal-comp-employees
export const getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = list_complaints_dto.parse(req.query);
  const result = await service.listComplaints(filters);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Complaints retrieved successfully')
    .withData(result.data)
    .withMeta(result.meta)
    .success()
    .send();
});

// GET /api/sal-comp-employees/:id
export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const data = await service.getComplaintById(id);

  if (!data) {
    res.build
      .withStatus(404)
      .withError('NOT_FOUND', 'Complaint not found')
      .fail()
      .send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Complaint retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// POST /api/sal-comp-employees
export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = create_complaint_dto.parse(req.body);
  const data = await service.createComplaint(dto);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('Complaint created successfully')
    .withData({ pk_com_id: data })
    .success()
    .send();
});

// PUT /api/sal-comp-employees/:id
export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const dto = update_complaint_dto.parse(req.body);
  const success = await service.updateComplaint(id, dto);

  if (!success) {
    res.build
      .withStatus(404)
      .withError('NOT_FOUND', 'Complaint not found for update')
      .fail()
      .send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Complaint updated successfully')
    .success()
    .send();
});

// DELETE /api/sal-comp-employees/:id
export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const success = await service.deleteComplaint(id);

  if (!success) {
    res.build
      .withStatus(404)
      .withError('NOT_FOUND', 'Complaint not found for deletion')
      .fail()
      .send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Complaint deleted successfully')
    .success()
    .send();
});
