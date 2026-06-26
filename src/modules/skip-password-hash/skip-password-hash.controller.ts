/**
 * skip-password-hash.controller.ts
 * Request/response mappings for skip password hash module
 */

import type { Request, Response } from 'express';

import {
  createSkipPasswordHashUserSchema,
  skipPasswordHashUserIdSchema,
  updateSkipPasswordHashUserSchema,
} from './skip-password-hash.dto.js';
import * as service from './skip-password-hash.service.js';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const users = await service.getAllSkipPasswordHashUsers();

    res.build
      .withStatus(200)
      .withMessage('Retrieved successfully')
      .withModule('SkipPasswordHash')
      .withData(users)
      .success()
      .send();
  } catch (err: any) {
    res.build.withStatus(500).withError('FETCH_FAILED', err.message || 'Failed to fetch users').fail().send();
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const parsed = skipPasswordHashUserIdSchema.safeParse(req.params);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', {
          message: 'Invalid user ID',
          validationErrors: parsed.error.issues,
        })
        .fail()
        .send();
      return;
    }

    const user = await service.getSkipPasswordHashUserById(parsed.data.id);
    if (!user) {
      res.build.withStatus(404).withError('NOT_FOUND', 'User not found').fail().send();
      return;
    }

    res.build
      .withStatus(200)
      .withMessage('Retrieved successfully')
      .withModule('SkipPasswordHash')
      .withData(user)
      .success()
      .send();
  } catch (err: any) {
    res.build.withStatus(500).withError('FETCH_FAILED', err.message || 'Failed to fetch user').fail().send();
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createSkipPasswordHashUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', {
          message: 'Invalid input data',
          validationErrors: parsed.error.issues,
        })
        .fail()
        .send();
      return;
    }

    // Check if username already exists
    const existingUser = await service.getSkipPasswordHashUserByUsername(parsed.data.username);
    if (existingUser) {
      res.build.withStatus(409).withError('CONFLICT', 'Username already exists').fail().send();
      return;
    }

    const newUser = await service.createSkipPasswordHashUser(parsed.data);

    res.build
      .withStatus(201)
      .withMessage('Created successfully')
      .withModule('SkipPasswordHash')
      .withData(newUser)
      .success()
      .send();
  } catch (err: any) {
    res.build.withStatus(500).withError('CREATE_FAILED', err.message || 'Failed to create user').fail().send();
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const idParsed = skipPasswordHashUserIdSchema.safeParse(req.params);
    if (!idParsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', {
          message: 'Invalid user ID',
          validationErrors: idParsed.error.issues,
        })
        .fail()
        .send();
      return;
    }

    const dataParsed = updateSkipPasswordHashUserSchema.safeParse(req.body);
    if (!dataParsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', {
          message: 'Invalid input data',
          validationErrors: dataParsed.error.issues,
        })
        .fail()
        .send();
      return;
    }

    // Check if user exists
    const existingUser = await service.getSkipPasswordHashUserById(idParsed.data.id);
    if (!existingUser) {
      res.build.withStatus(404).withError('NOT_FOUND', 'User not found').fail().send();
      return;
    }

    // Check if new username already exists (if username is being updated)
    if (dataParsed.data.username && dataParsed.data.username !== existingUser.username) {
      const usernameExists = await service.getSkipPasswordHashUserByUsername(dataParsed.data.username);
      if (usernameExists) {
        res.build.withStatus(409).withError('CONFLICT', 'Username already exists').fail().send();
        return;
      }
    }

    // Build update data with only defined properties
    const updateData: any = {};
    if (dataParsed.data.username !== undefined) {
      updateData.username = dataParsed.data.username;
    }
    if (dataParsed.data.is_active !== undefined) {
      updateData.is_active = dataParsed.data.is_active;
    }

    const updatedUser = await service.updateSkipPasswordHashUser(idParsed.data.id, updateData);

    res.build
      .withStatus(200)
      .withMessage('Updated successfully')
      .withModule('SkipPasswordHash')
      .withData(updatedUser)
      .success()
      .send();
  } catch (err: any) {
    res.build.withStatus(500).withError('UPDATE_FAILED', err.message || 'Failed to update user').fail().send();
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const parsed = skipPasswordHashUserIdSchema.safeParse(req.params);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', {
          message: 'Invalid user ID',
          validationErrors: parsed.error.issues,
        })
        .fail()
        .send();
      return;
    }

    // Check if user exists
    const existingUser = await service.getSkipPasswordHashUserById(parsed.data.id);
    if (!existingUser) {
      res.build.withStatus(404).withError('NOT_FOUND', 'User not found').fail().send();
      return;
    }

    const deleted = await service.deleteSkipPasswordHashUser(parsed.data.id);

    res.build
      .withStatus(200)
      .withMessage('Deleted successfully')
      .withModule('SkipPasswordHash')
      .withData({ deleted })
      .success()
      .send();
  } catch (err: any) {
    res.build.withStatus(500).withError('DELETE_FAILED', err.message || 'Failed to delete user').fail().send();
  }
}
