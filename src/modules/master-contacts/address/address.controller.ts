import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { createAddressSchema, updateAddressSchema, addressFilterSchema } from './address.dto.js';
import * as service from './address.service.js';

// ─────────────────────────────────────────────
// address.controller.ts
// ─────────────────────────────────────────────

const MODULE = 'address';

// GET /addresses?contact_name=&address=&city=&...
// Mirrors VB FillList() / grList filter
export const getList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const params = addressFilterSchema.parse(req.query);
  const result = await service.getList(params);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Addresses retrieved successfully')
    .withData(result)
    .success()
    .send();
});

// GET /addresses/:id
// Mirrors SelectRecord()
export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const pk = parseInt(String(req.params['id']), 10);
  if (isNaN(pk)) {
    res.build
      .withStatus(400)
      .withError('INVALID_ID', 'Address ID must be a valid integer')
      .fail()
      .send();
    return;
  }
  const row = await service.getById(pk);
  if (!row) {
    res.build.withStatus(404).withError('NOT_FOUND', 'Address not found').fail().send();
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Address retrieved successfully')
    .withData(row)
    .success()
    .send();
});

// POST /addresses
// Mirrors btSave → SaveRecords (EditMode = False / new)
export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createAddressSchema.parse(req.body);

  // Validation: address required (Zod already handles this, belt-and-suspenders)
  if (!dto.address?.trim()) {
    res.build.withStatus(422).withError('VALIDATION_ERROR', 'Please enter Address.').fail().send();
    return;
  }

  // Duplicate check (mirrors ValidateFields)
  const dup = await service.isDuplicate(dto.fk_cont_id, dto.address);
  if (dup) {
    res.build
      .withStatus(409)
      .withError('DUPLICATE', `"${dto.address}" for this organization already exists.`)
      .fail()
      .send();
    return;
  }

  const addr = await service.create(dto);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('Address saved successfully.')
    .withData(addr)
    .success()
    .send();
});

// PUT /addresses/:id
// Mirrors btSave → SaveRecords (EditMode = True)
export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const pk = parseInt(String(req.params['id']), 10);
  if (isNaN(pk)) {
    res.build
      .withStatus(400)
      .withError('INVALID_ID', 'Address ID must be a valid integer')
      .fail()
      .send();
    return;
  }

  const dto = updateAddressSchema.parse(req.body);

  // Duplicate check excluding self
  if (dto.fk_cont_id && dto.address) {
    const dup = await service.isDuplicate(dto.fk_cont_id, dto.address, pk);
    if (dup) {
      res.build
        .withStatus(409)
        .withError('DUPLICATE', `"${dto.address}" for this organization already exists.`)
        .fail()
        .send();
      return;
    }
  }

  const addr = await service.update(pk, dto);
  if (!addr) {
    res.build.withStatus(404).withError('NOT_FOUND', 'Address not found').fail().send();
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Address updated successfully.')
    .withData(addr)
    .success()
    .send();
});

// DELETE /addresses/:id
// Mirrors btDelete / grList.DeletingRecords + DeletePossible check
export const deleteAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const pk = parseInt(String(req.params['id']), 10);
  if (isNaN(pk)) {
    res.build
      .withStatus(400)
      .withError('INVALID_ID', 'Address ID must be a valid integer')
      .fail()
      .send();
    return;
  }

  const existing = await service.getById(pk);
  if (!existing) {
    res.build.withStatus(404).withError('NOT_FOUND', 'Address not found').fail().send();
    return;
  }

  const deleted = await service.deleteAddress(pk);
  if (!deleted) {
    res.build
      .withStatus(409)
      .withError(
        'CONFLICT',
        'Cannot delete this address because it is referenced by existing transaction records.',
      )
      .fail()
      .send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage(`Address of "${existing.contact_name}" deleted successfully.`)
    .success()
    .send();
});

export const getOrganizationsDropdown = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const list = await service.getOrganizationsDropdown();
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Organizations retrieved successfully')
      .withData(list)
      .success()
      .send();
  },
);
