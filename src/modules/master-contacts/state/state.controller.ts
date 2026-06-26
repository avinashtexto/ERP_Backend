import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { createStateDto, updateStateDto, listStateDto, stateIdParamDto } from './state.dto.js';
import * as service from './state.service.js';

const MODULE = 'state';

// ─── GET /dropdown ────────────────────────────────────────────────────────────

export const getDropdown = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const countryId = req.query['countryId'] ? Number(req.query['countryId']) : undefined;
  const data = await service.getStateDropdown(countryId);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('State dropdown retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// ─── GET / ────────────────────────────────────────────────────────────────────

export const getStates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = listStateDto.parse(req.query);
  const result = await service.listStates(query);

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('States list retrieved successfully')
    .withData(result)
    .success()
    .send();
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────

export const getStateById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = stateIdParamDto.parse(req.params);
  const state = await service.findStateById(id);

  if (!state) {
    res.build
      .withStatus(404)
      .withModule(MODULE)
      .withError('NOT_FOUND', `State with id '${id}' not found`)
      .fail()
      .send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('State retrieved successfully')
    .withData(state)
    .success()
    .send();
});

// ─── POST / ───────────────────────────────────────────────────────────────────

export const createState = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createStateDto.parse(req.body);

  const duplicate = await service.findStateByNameAndCountry(dto.state, dto.fk_ctry_id);
  if (duplicate) {
    res.build
      .withStatus(409)
      .withModule(MODULE)
      .withError('ALREADY_EXISTS', `State '${dto.state}' already exists in this country`)
      .fail()
      .send();
    return;
  }

  const created = await service.createState(dto);

  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('State created successfully')
    .withData(created)
    .success()
    .send();
});

// ─── PUT /:id ─────────────────────────────────────────────────────────────────

export const updateState = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = stateIdParamDto.parse(req.params);
  const dto = updateStateDto.parse(req.body);

  const existing = await service.findStateById(id);
  if (!existing) {
    res.build
      .withStatus(404)
      .withModule(MODULE)
      .withError('NOT_FOUND', `State with id '${id}' not found`)
      .fail()
      .send();
    return;
  }

  const stateName = dto.state ?? existing.state;
  const countryId = dto.fk_ctry_id ?? existing.fk_ctry_id;

  const duplicate = await service.findStateByNameAndCountry(stateName, countryId, id);
  if (duplicate) {
    res.build
      .withStatus(409)
      .withModule(MODULE)
      .withError('ALREADY_EXISTS', `State '${stateName}' already exists in this country`)
      .fail()
      .send();
    return;
  }

  const updated = await service.updateState(id, dto);

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('State updated successfully')
    .withData(updated)
    .success()
    .send();
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

export const deleteState = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = stateIdParamDto.parse(req.params);

  const existing = await service.findStateById(id);
  if (!existing) {
    res.build
      .withStatus(404)
      .withModule(MODULE)
      .withError('NOT_FOUND', `State with id '${id}' not found`)
      .fail()
      .send();
    return;
  }

  const canDelete = await service.isStateDeletable(id);
  if (!canDelete) {
    res.build
      .withStatus(409)
      .withModule(MODULE)
      .withError(
        'CONFLICT',
        `State '${existing.state}' cannot be deleted because it is referenced by other records`,
      )
      .fail()
      .send();
    return;
  }

  const deleted = await service.deleteState(id);

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('State deleted successfully')
    .withData(deleted)
    .success()
    .send();
});
