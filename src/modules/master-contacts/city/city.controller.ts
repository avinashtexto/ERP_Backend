import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { createCitySchema, updateCitySchema, cityFilterSchema } from './city.dto.js';
import * as service from './city.service.js';

// ─────────────────────────────────────────────
// city.controller.ts
// ─────────────────────────────────────────────

const MODULE = 'city';

// GET /dropdown — Mirrors VB FillCity() — lightweight combo-box list
export const getDropdown = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const data = await service.getDropdownList();
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('City dropdown retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// GET / — paginated + filtered list (grList / FillList)
export const getList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const params = cityFilterSchema.parse(req.query);
  const result = await service.getList(params);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Cities retrieved successfully')
    .withData(result)
    .success()
    .send();
});

// GET /:id — single city record
export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const city = await service.getById(Number(req.params['id']));
  if (!city) {
    res.build.withStatus(404).withError('NOT_FOUND', 'City not found').fail().send();
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('City retrieved successfully')
    .withData(city)
    .success()
    .send();
});

// POST / — create (btSave, new mode)
export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createCitySchema.parse(req.body);

  const duplicate = await service.isDuplicate(dto.city);
  if (duplicate) {
    res.build
      .withStatus(409)
      .withError('DUPLICATE', `City "${dto.city}" already exists.`)
      .fail()
      .send();
    return;
  }

  const city = await service.create(dto);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage(`City "${city.city}" saved successfully.`)
    .withData(city)
    .success()
    .send();
});

// PUT /:id — update (btSave, edit mode)
export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = updateCitySchema.parse(req.body);

  if (dto.city) {
    const duplicate = await service.isDuplicate(dto.city, Number(req.params['id']));
    if (duplicate) {
      res.build
        .withStatus(409)
        .withError('DUPLICATE', `City "${dto.city}" already exists.`)
        .fail()
        .send();
      return;
    }
  }

  const city = await service.update(Number(req.params['id']), dto);
  if (!city) {
    res.build.withStatus(404).withError('NOT_FOUND', 'City not found').fail().send();
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage(`City "${city.city}" updated successfully.`)
    .withData(city)
    .success()
    .send();
});

// DELETE /:id — delete (btDelete / grList delete)
export const deleteCity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const existing = await service.getById(Number(req.params['id']));
  if (!existing) {
    res.build.withStatus(404).withError('NOT_FOUND', 'City not found').fail().send();
    return;
  }

  const deleted = await service.deleteCity(Number(req.params['id']));
  if (!deleted) {
    res.build
      .withStatus(409)
      .withError(
        'CONFLICT',
        'Cannot delete this city because it is referenced by existing address records.',
      )
      .fail()
      .send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage(`City "${existing.city}" deleted successfully.`)
    .success()
    .send();
});
