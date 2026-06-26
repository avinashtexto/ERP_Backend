import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { createTitleSchema, updateTitleSchema, titleQuerySchema } from './title.dto.js';
import * as service from './title.service.js';

// ─────────────────────────────────────────────
// title.controller.ts
// ─────────────────────────────────────────────

const MODULE = 'title';

// GET /title  — list with optional search/last_status filter
export const getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = titleQuerySchema.parse(req.query);
  const data = await service.findAll(filters);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Titles retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// GET /title/:id  — single title by PK
export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params['id']), 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withError('INVALID_ID', 'Title ID must be a valid integer')
      .fail()
      .send();
    return;
  }
  const data = await service.findById(id);
  if (!data) {
    res.build.withStatus(404).withError('NOT_FOUND', 'Title not found').fail().send();
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Title retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// POST /title  — create
export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createTitleSchema.parse(req.body);

  const dup = await service.isDuplicate(dto.title);
  if (dup) {
    res.build
      .withStatus(409)
      .withError('DUPLICATE', `Title "${dto.title}" already exists.`)
      .fail()
      .send();
    return;
  }

  const data = await service.create(dto);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage(`Title "${data.title}" created successfully.`)
    .withData(data)
    .success()
    .send();
});

// PUT /title/:id  — update
export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params['id']), 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withError('INVALID_ID', 'Title ID must be a valid integer')
      .fail()
      .send();
    return;
  }

  const dto = updateTitleSchema.parse(req.body);

  if (dto.title) {
    const dup = await service.isDuplicate(dto.title, id);
    if (dup) {
      res.build
        .withStatus(409)
        .withError('DUPLICATE', `Title "${dto.title}" already exists.`)
        .fail()
        .send();
      return;
    }
  }

  const data = await service.update(id, dto);
  if (!data) {
    res.build.withStatus(404).withError('NOT_FOUND', 'Title not found').fail().send();
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage(`Title "${data.title}" updated successfully.`)
    .withData(data)
    .success()
    .send();
});

// DELETE /title/:id  — delete with FK guards
export const deleteTitle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params['id']), 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withError('INVALID_ID', 'Title ID must be a valid integer')
      .fail()
      .send();
    return;
  }

  const result = await service.deleteTitle(id);

  if (!result.deleted) {
    if (result.reason === 'NOT_FOUND') {
      res.build.withStatus(404).withError('NOT_FOUND', 'Title not found').fail().send();
      return;
    }
    res.build
      .withStatus(409)
      .withError(
        'CONFLICT',
        'Cannot delete this title because it is referenced by existing contact records.',
      )
      .fail()
      .send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Title deleted successfully.')
    .success()
    .send();
});
