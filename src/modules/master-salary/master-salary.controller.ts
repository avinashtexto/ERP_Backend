import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import {
  createSalSkintoneSchema,
  updateSalSkintoneSchema,
  salSkintoneQuerySchema,
  createSalCastesSchema,
  updateSalCastesSchema,
  salCastesQuerySchema,
  createSalReligionSchema,
  updateSalReligionSchema,
  salReligionQuerySchema,
  createSalScheduleTypeSchema,
  updateSalScheduleTypeSchema,
  salScheduleTypeQuerySchema,
} from './master-salary.dto.js';
import * as service from './master-salary.service.js';

// ============================================================================
// Module Names
// ============================================================================
const SKIN_TONE_MODULE_NAME = 'master-salary/Skintone';
const CASTE_MODULE_NAME = 'master-salary/Caste';
const RELIGION_MODULE_NAME = 'master-salary/Religion';
const SCHEDULE_TYPE_MODULE_NAME = 'master-salary/Schedule Type';

// ============================================================================
// Error Handler Helper
// ============================================================================
const handleServiceError = (res: Response, err: unknown, moduleName: string) => {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes('not found')) {
    res.build
      .withStatus(404)
      .withModule(moduleName)
      .withError('NOT_FOUND', message)
      .withMessage('Record not found')
      .fail()
      .send();
    return;
  }
  if (message.includes('already exists')) {
    res.build
      .withStatus(409)
      .withModule(moduleName)
      .withError('CONFLICT', message)
      .withMessage('Conflict - Resource already exists')
      .fail()
      .send();
    return;
  }
  if (message.includes('related to other data') || message.includes('foreign key')) {
    res.build
      .withStatus(409)
      .withModule(moduleName)
      .withError('DEPENDENCY_ERROR', message)
      .withMessage('Conflict - Foreign key reference check failed')
      .fail()
      .send();
    return;
  }
  res.build
    .withStatus(500)
    .withModule(moduleName)
    .withError('INTERNAL_ERROR', message)
    .withMessage('Internal Server Error')
    .fail()
    .send();
};

// ============================================================================
// Skintone Handlers
// ============================================================================

export const getAllSkintones = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = salSkintoneQuerySchema.parse(req.query);
    const data = await service.findAllSkintones(filters);
    res.build
      .withStatus(200)
      .withModule(SKIN_TONE_MODULE_NAME)
      .withMessage('SalSkintones retrieved successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, SKIN_TONE_MODULE_NAME);
  }
});

export const getSkintoneById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(SKIN_TONE_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    const data = await service.findSkintoneById(id);
    if (!data) {
      res.build
        .withStatus(404)
        .withModule(SKIN_TONE_MODULE_NAME)
        .withError('NOT_FOUND', 'SalSkintone record not found.')
        .withMessage('Record not found')
        .fail()
        .send();
      return;
    }
    res.build
      .withStatus(200)
      .withModule(SKIN_TONE_MODULE_NAME)
      .withMessage('SalSkintone retrieved successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, SKIN_TONE_MODULE_NAME);
  }
});

export const createSkintone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const dto = createSalSkintoneSchema.parse(req.body);
    const data = await service.createSkintone(dto);
    res.build
      .withStatus(201)
      .withModule(SKIN_TONE_MODULE_NAME)
      .withMessage('SalSkintone created successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, SKIN_TONE_MODULE_NAME);
  }
});

export const updateSkintone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(SKIN_TONE_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    const dto = updateSalSkintoneSchema.parse(req.body);
    const data = await service.updateSkintone(id, dto);
    res.build
      .withStatus(200)
      .withModule(SKIN_TONE_MODULE_NAME)
      .withMessage('SalSkintone updated successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, SKIN_TONE_MODULE_NAME);
  }
});

export const removeSkintone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(SKIN_TONE_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    await service.deleteSkintone(id);
    res.build
      .withStatus(200)
      .withModule(SKIN_TONE_MODULE_NAME)
      .withMessage('SalSkintone deleted successfully')
      .withData({ pk_st_id: id })
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, SKIN_TONE_MODULE_NAME);
  }
});

// ============================================================================
// Castes Handlers
// ============================================================================

export const getAllCastes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = salCastesQuerySchema.parse(req.query);
    const data = await service.findAllCastes(filters);
    res.build
      .withStatus(200)
      .withModule(CASTE_MODULE_NAME)
      .withMessage('SalCastes retrieved successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, CASTE_MODULE_NAME);
  }
});

export const getCasteById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(CASTE_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    const data = await service.findCasteById(id);
    if (!data) {
      res.build
        .withStatus(404)
        .withModule(CASTE_MODULE_NAME)
        .withError('NOT_FOUND', 'SalCaste record not found.')
        .withMessage('Record not found')
        .fail()
        .send();
      return;
    }
    res.build
      .withStatus(200)
      .withModule(CASTE_MODULE_NAME)
      .withMessage('SalCaste retrieved successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, CASTE_MODULE_NAME);
  }
});

export const createCaste = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const dto = createSalCastesSchema.parse(req.body);
    const data = await service.createCaste(dto);
    res.build
      .withStatus(201)
      .withModule(CASTE_MODULE_NAME)
      .withMessage('SalCaste created successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, CASTE_MODULE_NAME);
  }
});

export const updateCaste = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(CASTE_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    const dto = updateSalCastesSchema.parse(req.body);
    const data = await service.updateCaste(id, dto);
    res.build
      .withStatus(200)
      .withModule(CASTE_MODULE_NAME)
      .withMessage('SalCaste updated successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, CASTE_MODULE_NAME);
  }
});

export const removeCaste = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(CASTE_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    await service.deleteCaste(id);
    res.build
      .withStatus(200)
      .withModule(CASTE_MODULE_NAME)
      .withMessage('SalCaste deleted successfully')
      .withData({ pk_cs_id: id })
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, CASTE_MODULE_NAME);
  }
});

// ============================================================================
// Religion Handlers
// ============================================================================

export const getAllReligions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = salReligionQuerySchema.parse(req.query);
    const data = await service.findAllReligions(filters);
    res.build
      .withStatus(200)
      .withModule(RELIGION_MODULE_NAME)
      .withMessage('SalReligions retrieved successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, RELIGION_MODULE_NAME);
  }
});

export const getReligionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(RELIGION_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    const data = await service.findReligionById(id);
    if (!data) {
      res.build
        .withStatus(404)
        .withModule(RELIGION_MODULE_NAME)
        .withError('NOT_FOUND', 'SalReligion record not found.')
        .withMessage('Record not found')
        .fail()
        .send();
      return;
    }
    res.build
      .withStatus(200)
      .withModule(RELIGION_MODULE_NAME)
      .withMessage('SalReligion retrieved successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, RELIGION_MODULE_NAME);
  }
});

export const createReligion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const dto = createSalReligionSchema.parse(req.body);
    const data = await service.createReligion(dto);
    res.build
      .withStatus(201)
      .withModule(RELIGION_MODULE_NAME)
      .withMessage('SalReligion created successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, RELIGION_MODULE_NAME);
  }
});

export const updateReligion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(RELIGION_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    const dto = updateSalReligionSchema.parse(req.body);
    const data = await service.updateReligion(id, dto);
    res.build
      .withStatus(200)
      .withModule(RELIGION_MODULE_NAME)
      .withMessage('SalReligion updated successfully')
      .withData(data)
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, RELIGION_MODULE_NAME);
  }
});

export const removeReligion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.build
      .withStatus(400)
      .withModule(RELIGION_MODULE_NAME)
      .withError('INVALID_ID', 'ID must be a number.')
      .withMessage('Bad Request - Invalid ID')
      .fail()
      .send();
    return;
  }
  try {
    await service.deleteReligion(id);
    res.build
      .withStatus(200)
      .withModule(RELIGION_MODULE_NAME)
      .withMessage('SalReligion deleted successfully')
      .withData({ pk_rg_id: id })
      .success()
      .send();
  } catch (err) {
    handleServiceError(res, err, RELIGION_MODULE_NAME);
  }
});

// ============================================================================
// ScheduleType Handlers
// ============================================================================

export const getAllScheduleTypes = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = salScheduleTypeQuerySchema.parse(req.query);
      const data = await service.findAllScheduleTypes(filters);
      res.build
        .withStatus(200)
        .withModule(SCHEDULE_TYPE_MODULE_NAME)
        .withMessage('SalScheduleTypes retrieved successfully')
        .withData(data)
        .success()
        .send();
    } catch (err) {
      handleServiceError(res, err, SCHEDULE_TYPE_MODULE_NAME);
    }
  },
);

export const getScheduleTypeById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.build
        .withStatus(400)
        .withModule(SCHEDULE_TYPE_MODULE_NAME)
        .withError('INVALID_ID', 'ID must be a number.')
        .withMessage('Bad Request - Invalid ID')
        .fail()
        .send();
      return;
    }
    try {
      const data = await service.findScheduleTypeById(id);
      if (!data) {
        res.build
          .withStatus(404)
          .withModule(SCHEDULE_TYPE_MODULE_NAME)
          .withError('NOT_FOUND', 'SalScheduleType record not found.')
          .withMessage('Record not found')
          .fail()
          .send();
        return;
      }
      res.build
        .withStatus(200)
        .withModule(SCHEDULE_TYPE_MODULE_NAME)
        .withMessage('SalScheduleType retrieved successfully')
        .withData(data)
        .success()
        .send();
    } catch (err) {
      handleServiceError(res, err, SCHEDULE_TYPE_MODULE_NAME);
    }
  },
);

export const createScheduleType = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = createSalScheduleTypeSchema.parse(req.body);
      const data = await service.createScheduleType(dto);
      res.build
        .withStatus(201)
        .withModule(SCHEDULE_TYPE_MODULE_NAME)
        .withMessage('SalScheduleType created successfully')
        .withData(data)
        .success()
        .send();
    } catch (err) {
      handleServiceError(res, err, SCHEDULE_TYPE_MODULE_NAME);
    }
  },
);

export const updateScheduleType = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.build
        .withStatus(400)
        .withModule(SCHEDULE_TYPE_MODULE_NAME)
        .withError('INVALID_ID', 'ID must be a number.')
        .withMessage('Bad Request - Invalid ID')
        .fail()
        .send();
      return;
    }
    try {
      const dto = updateSalScheduleTypeSchema.parse(req.body);
      const data = await service.updateScheduleType(id, dto);
      res.build
        .withStatus(200)
        .withModule(SCHEDULE_TYPE_MODULE_NAME)
        .withMessage('SalScheduleType updated successfully')
        .withData(data)
        .success()
        .send();
    } catch (err) {
      handleServiceError(res, err, SCHEDULE_TYPE_MODULE_NAME);
    }
  },
);

export const removeScheduleType = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.build
        .withStatus(400)
        .withModule(SCHEDULE_TYPE_MODULE_NAME)
        .withError('INVALID_ID', 'ID must be a number.')
        .withMessage('Bad Request - Invalid ID')
        .fail()
        .send();
      return;
    }
    try {
      await service.deleteScheduleType(id);
      res.build
        .withStatus(200)
        .withModule(SCHEDULE_TYPE_MODULE_NAME)
        .withMessage('SalScheduleType deleted successfully')
        .withData({ pk_st_id: id })
        .success()
        .send();
    } catch (err) {
      handleServiceError(res, err, SCHEDULE_TYPE_MODULE_NAME);
    }
  },
);
