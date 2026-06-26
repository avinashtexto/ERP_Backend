import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { createRegionDto, updateRegionDto, listRegionDto, regionIdParamDto } from './region.dto.js';
import * as service from './region.service.js';

const MODULE = 'region';

// ─── GET /dropdown ────────────────────────────────────────────────────────────

export const getDropdown = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await service.getRegionDropdown();
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Region dropdown retrieved successfully')
    .withData(data)
    .success()
    .send();
});

// ─── GET / ────────────────────────────────────────────────────────────────────

export const getRegions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = listRegionDto.parse(req.query);
  const result = await service.listRegions(query);

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Regions list retrieved successfully')
    .withData(result)
    .success()
    .send();
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────

export const getRegionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = regionIdParamDto.parse(req.params);
  const region = await service.findRegionById(id);

  if (!region) {
    res.build
      .withStatus(404)
      .withModule(MODULE)
      .withError('NOT_FOUND', `Region with id '${id}' not found`)
      .fail()
      .send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Region retrieved successfully')
    .withData(region)
    .success()
    .send();
});

// ─── POST / ───────────────────────────────────────────────────────────────────

export const createRegion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createRegionDto.parse(req.body);

  const duplicate = await service.findRegionByName(dto.region);
  if (duplicate) {
    res.build
      .withStatus(409)
      .withModule(MODULE)
      .withError('ALREADY_EXISTS', `Region '${dto.region}' already exists`)
      .fail()
      .send();
    return;
  }

  const created = await service.createRegion(dto);

  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('Region created successfully')
    .withData(created)
    .success()
    .send();
});

// ─── PUT /:id ─────────────────────────────────────────────────────────────────

export const updateRegion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = regionIdParamDto.parse(req.params);
  const dto = updateRegionDto.parse(req.body);

  const existing = await service.findRegionById(id);
  if (!existing) {
    res.build
      .withStatus(404)
      .withModule(MODULE)
      .withError('NOT_FOUND', `Region with id '${id}' not found`)
      .fail()
      .send();
    return;
  }

  if (dto.region) {
    const duplicate = await service.findRegionByName(dto.region, id);
    if (duplicate) {
      res.build
        .withStatus(409)
        .withModule(MODULE)
        .withError('ALREADY_EXISTS', `Region '${dto.region}' already exists`)
        .fail()
        .send();
      return;
    }
  }

  const updated = await service.updateRegion(id, dto);

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Region updated successfully')
    .withData(updated)
    .success()
    .send();
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

export const deleteRegion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = regionIdParamDto.parse(req.params);

  const existing = await service.findRegionById(id);
  if (!existing) {
    res.build
      .withStatus(404)
      .withModule(MODULE)
      .withError('NOT_FOUND', `Region with id '${id}' not found`)
      .fail()
      .send();
    return;
  }

  const canDelete = await service.isRegionDeletable(id);
  if (!canDelete) {
    res.build
      .withStatus(409)
      .withModule(MODULE)
      .withError(
        'CONFLICT',
        `Region '${existing.region}' cannot be deleted because it is referenced by other records`,
      )
      .fail()
      .send();
    return;
  }

  const deleted = await service.deleteRegion(id);

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Region deleted successfully')
    .withData(deleted)
    .success()
    .send();
});
