import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import {
  createAcctGroupSchema,
  updateAcctGroupSchema,
  acctGroupQuerySchema,
} from './account-groups.dto.js';
import * as service from './account-groups.service.js';

const MODULE = 'account-groups';

// GET /acct-groups
export const getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = acctGroupQuerySchema.parse(req.query);
  const data = await service.findAll(filters);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Account groups retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// GET /acct-groups/tree
export const getTree = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const data = await service.findTree();
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Account groups hierarchy tree retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// GET /acct-groups/parents
export const getParents = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const data = await service.findParentCandidates();
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Parent candidates retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// GET /acct-groups/:id
export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const data = await service.findById(id);
  if (!data) {
    res.build
      .withStatus(404)
      .withError('NOT_FOUND', 'Account group record not found')
      .fail()
      .send();
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Account group retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// POST /acct-groups
export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createAcctGroupSchema.parse(req.body);
  const data = await service.create(dto);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('Account group created successfully')
    .withData(data)
    .success()
    .send();
});

// PUT /acct-groups/:id
export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const dto = updateAcctGroupSchema.parse(req.body);
  const data = await service.update(id, dto);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Account group updated successfully')
    .withData(data)
    .success()
    .send();
});

// DELETE /acct-groups/:id
export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  await service.deleteGroup(id);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Account group deleted successfully')
    .success()
    .send();
});
