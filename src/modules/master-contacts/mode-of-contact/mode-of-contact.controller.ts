import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import {
  createModeOfContactDto,
  updateModeOfContactDto,
  listModeOfContactDto,
  modeOfContactIdParamDto,
} from './mode-of-contact.dto.js';
import * as service from './mode-of-contact.service.js';

const MODULE = 'mode-of-contact';

// ─── GET / ────────────────────────────────────────────────────────────────────

export const getModesOfContact = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = listModeOfContactDto.parse(req.query);
    const result = await service.listModesOfContact(query);

    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Modes of Contact list retrieved successfully')
      .withData(result)
      .success()
      .send();
  },
);

// ─── GET /types ───────────────────────────────────────────────────────────────

export const getModeOfContactTypes = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await service.getModeOfContactTypes();

    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Mode of Contact Types retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

// ─── GET /:id ─────────────────────────────────────────────────────────────────

export const getModeOfContactById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = modeOfContactIdParamDto.parse(req.params);
    const moc = await service.findModeOfContactById(id);

    if (!moc) {
      res.build
        .withStatus(404)
        .withModule(MODULE)
        .withError('NOT_FOUND', `Mode of Contact with id '${id}' not found`)
        .fail()
        .send();
      return;
    }

    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Mode of Contact retrieved successfully')
      .withData(moc)
      .success()
      .send();
  },
);

// ─── POST / ───────────────────────────────────────────────────────────────────

export const createModeOfContact = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const dto = createModeOfContactDto.parse(req.body);

    const duplicate = await service.findModeOfContactByName(dto.moc);
    if (duplicate) {
      res.build
        .withStatus(409)
        .withModule(MODULE)
        .withError('ALREADY_EXISTS', `Mode of Contact '${dto.moc}' already exists`)
        .fail()
        .send();
      return;
    }

    const created = await service.createModeOfContact(dto);

    res.build
      .withStatus(201)
      .withModule(MODULE)
      .withMessage('Mode of Contact created successfully')
      .withData(created)
      .success()
      .send();
  },
);

// ─── PUT /:id ─────────────────────────────────────────────────────────────────

export const updateModeOfContact = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = modeOfContactIdParamDto.parse(req.params);
    const dto = updateModeOfContactDto.parse(req.body);

    const existing = await service.findModeOfContactById(id);
    if (!existing) {
      res.build
        .withStatus(404)
        .withModule(MODULE)
        .withError('NOT_FOUND', `Mode of Contact with id '${id}' not found`)
        .fail()
        .send();
      return;
    }

    if (dto.moc) {
      const duplicate = await service.findModeOfContactByName(dto.moc, id);
      if (duplicate) {
        res.build
          .withStatus(409)
          .withModule(MODULE)
          .withError('ALREADY_EXISTS', `Mode of Contact '${dto.moc}' already exists`)
          .fail()
          .send();
        return;
      }
    }

    const updated = await service.updateModeOfContact(id, dto);

    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Mode of Contact updated successfully')
      .withData(updated)
      .success()
      .send();
  },
);

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

export const deleteModeOfContact = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = modeOfContactIdParamDto.parse(req.params);

    const existing = await service.findModeOfContactById(id);
    if (!existing) {
      res.build
        .withStatus(404)
        .withModule(MODULE)
        .withError('NOT_FOUND', `Mode of Contact with id '${id}' not found`)
        .fail()
        .send();
      return;
    }

    const canDelete = await service.isModeOfContactDeletable(id);
    if (!canDelete) {
      res.build
        .withStatus(409)
        .withModule(MODULE)
        .withError(
          'CONFLICT',
          `Mode of Contact '${existing.moc}' cannot be deleted because it is referenced by other records`,
        )
        .fail()
        .send();
      return;
    }

    const deleted = await service.deleteModeOfContact(id);

    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Mode of Contact deleted successfully')
      .withData(deleted)
      .success()
      .send();
  },
);
