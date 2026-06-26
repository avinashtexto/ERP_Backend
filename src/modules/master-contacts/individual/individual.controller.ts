import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import {
  createIndividualBodySchema,
  updateIndividualBodySchema,
  listIndividualQuerySchema,
  individualIdParamSchema,
} from './individual.dto.js';
import * as service from './individual.service.js';

const MODULE = 'individual';

export const health = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Individual health check successful')
    .withData(null)
    .success()
    .send();
});

export const listIndividuals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = listIndividualQuerySchema.parse(req.query);
  const result = await service.findAllIndividuals(query);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Individuals retrieved successfully')
    .withData(result.data)
    .withMeta({
      total: result.total,
      page: result.page,
      limit: result.limit,
    })
    .success()
    .send();
});

export const getIndividualById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = individualIdParamSchema.parse({ id: req.params.id });
    const data = await service.findIndividualById(id);
    if (!data) {
      res.build
        .withStatus(404)
        .withError('INDIVIDUAL_NOT_FOUND', `Individual with ID ${id} not found`)
        .fail()
        .send();
      return;
    }
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Individual retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const createIndividual = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = createIndividualBodySchema.parse(req.body);
  const data = await service.createIndividual(body);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('Individual created successfully')
    .withData(data)
    .success()
    .send();
});

export const updateIndividual = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = individualIdParamSchema.parse({ id: req.params.id });
  const body = updateIndividualBodySchema.parse(req.body);
  const data = await service.updateIndividual(id, body);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Individual updated successfully')
    .withData(data)
    .success()
    .send();
});

export const deleteIndividual = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = individualIdParamSchema.parse({ id: req.params.id });
  await service.removeIndividual(id);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Individual deleted successfully')
    .withData(null)
    .success()
    .send();
});
