/**
 * master-employee.controller.ts
 * Thin HTTP adapters.
 * Sanitizes input with Zod DTO schemas and formats response using ResponseBuilder.
 */

import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { createEmployeeSchema, updateEmployeeSchema } from './master-employee.dto.js';
import * as service from './master-employee.service.js';

export const listEmployees = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const pageSize = parseInt(String(req.query.pageSize ?? '50'), 10);

  const filters: { employee?: string; emp_code?: string } = {};
  if (typeof req.query.employee === 'string') {
    filters.employee = req.query.employee;
  }
  if (typeof req.query.emp_code === 'string') {
    filters.emp_code = req.query.emp_code;
  }

  const result = await service.listEmployees(filters, page, pageSize);

  res.build
    .withStatus(200)
    .withModule('master-employee')
    .withMessage('Employees list retrieved successfully')
    .withData(result)
    .success()
    .send();
});

export const getEmployee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.build.withStatus(400).withError('INVALID_ID', 'ID must be an integer').fail().send();
    return;
  }

  const employee = await service.getEmployee(id);
  if (!employee) {
    res.build.withStatus(404).withError('NOT_FOUND', 'Employee not found').fail().send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule('master-employee')
    .withMessage('Employee details retrieved successfully')
    .withData(employee)
    .success()
    .send();
});

export const createEmployee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = createEmployeeSchema.parse(req.body);

  // Uniqueness checks
  const isCodeUnique = await service.checkEmpCodeUnique(parsed.emp_code);
  if (!isCodeUnique) {
    res.build
      .withStatus(400)
      .withError('DUPLICATE_CODE', 'Employee code already exists')
      .fail()
      .send();
    return;
  }

  const isUsernameUnique = await service.checkUsernameUnique(parsed.username);
  if (!isUsernameUnique) {
    res.build
      .withStatus(400)
      .withError('DUPLICATE_USERNAME', 'Username already exists')
      .fail()
      .send();
    return;
  }

  // Get current user id and set id from request auth / headers
  const currentUserId = String((req as any).user?.id ?? '1');
  const setIdHeader = req.headers['x-set-id'];
  const setId = typeof setIdHeader === 'string' ? setIdHeader : '1';

  const created = await service.createEmployee(parsed, currentUserId, setId);

  res.build
    .withStatus(201)
    .withModule('master-employee')
    .withMessage('Employee created successfully')
    .withData(created)
    .success()
    .send();
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.build.withStatus(400).withError('INVALID_ID', 'ID must be an integer').fail().send();
    return;
  }

  const parsed = updateEmployeeSchema.parse(req.body);

  if (parsed.emp_code) {
    const isCodeUnique = await service.checkEmpCodeUnique(parsed.emp_code, id);
    if (!isCodeUnique) {
      res.build
        .withStatus(400)
        .withError('DUPLICATE_CODE', 'Employee code already exists')
        .fail()
        .send();
      return;
    }
  }

  if (parsed.username) {
    const isUsernameUnique = await service.checkUsernameUnique(parsed.username, id);
    if (!isUsernameUnique) {
      res.build
        .withStatus(400)
        .withError('DUPLICATE_USERNAME', 'Username already exists')
        .fail()
        .send();
      return;
    }
  }

  const currentUserId = String((req as any).user?.id ?? '1');
  const setIdHeader = req.headers['x-set-id'];
  const setId = typeof setIdHeader === 'string' ? setIdHeader : '1';

  const updated = await service.updateEmployee(id, parsed, currentUserId, setId);
  if (!updated) {
    res.build.withStatus(404).withError('NOT_FOUND', 'Employee not found').fail().send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule('master-employee')
    .withMessage('Employee updated successfully')
    .withData(updated)
    .success()
    .send();
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.build.withStatus(400).withError('INVALID_ID', 'ID must be an integer').fail().send();
    return;
  }

  const deleted = await service.deleteEmployee(id);
  if (!deleted) {
    res.build.withStatus(404).withError('NOT_FOUND', 'Employee not found').fail().send();
    return;
  }

  res.build
    .withStatus(200)
    .withModule('master-employee')
    .withMessage('Employee deleted successfully')
    .success()
    .send();
});

export const getNextEmpCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const nextCode = await service.getNextEmpCode();

  res.build
    .withStatus(200)
    .withModule('master-employee')
    .withMessage('Next employee code generated successfully')
    .withData({ nextCode })
    .success()
    .send();
});

export const getDocumentTypes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const docTypes = await service.getDocumentTypes();

  res.build
    .withStatus(200)
    .withModule('master-employee')
    .withMessage('Document types retrieved successfully')
    .withData(docTypes)
    .success()
    .send();
});
