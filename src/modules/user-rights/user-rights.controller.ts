import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import {
  saveUserRightsInSchema,
  getUserRightsParamsSchema,
  emptyQuerySchema,
  listUsersQuerySchema,
  createNewFormSchema,
} from './user-rights.dto.js';
import * as service from './user-rights.service.js';

// ---------------------------------------------------------------------------
// Controller Layer
// ---------------------------------------------------------------------------

export const health = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.build
    .withStatus(200)
    .withModule('User Rights')
    .withMessage('User Rights Module Healthy')
    .withData('ok')
    .success()
    .send();
});

export const listUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const queryParsed = listUsersQuerySchema.parse(req.query);
  const users = await service.listUsers();
  res.build
    .withStatus(200)
    .withModule('User Rights')
    .withMessage('Users retrieved successfully')
    .withData(users)
    .success()
    .send();
});

export const getUserRights = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  emptyQuerySchema.parse(req.query);
  const paramsParsed = getUserRightsParamsSchema.parse(req.params);

  const userId = paramsParsed.id;
  const rights = await service.loadUserRights(userId);
  res.build
    .withStatus(200)
    .withModule('User Rights')
    .withMessage('User rights retrieved successfully')
    .withData(rights)
    .success()
    .send();
});

export const getMyUserRights = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  emptyQuerySchema.parse(req.query);
  const userId = req.user?.pk_user_id || req.user?.id;
  if (!userId) {
    res.build.withStatus(401).withError('UNAUTHORIZED', 'User not authenticated').fail().send();
    return;
  }

  const rights = await service.loadUserRights(Number(userId));
  res.build
    .withStatus(200)
    .withModule('User Rights')
    .withMessage('My user rights retrieved successfully')
    .withData(rights)
    .success()
    .send();
});

export const saveUserRights = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  emptyQuerySchema.parse(req.query);
  const parsed = saveUserRightsInSchema.parse(req.body);

  const result = await service.saveUserRights(parsed);
  res.build
    .withStatus(200)
    .withModule('User Rights')
    .withMessage(result.message)
    .withData(null)
    .success()
    .send();
});

export const createNewForm = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  emptyQuerySchema.parse(req.query);
  const parsed = createNewFormSchema.parse(req.body);

  const result = await service.createNewForm(parsed);
  res.build
    .withStatus(200)
    .withModule('User Rights')
    .withMessage(result.message)
    .withData(null)
    .success()
    .send();
});
