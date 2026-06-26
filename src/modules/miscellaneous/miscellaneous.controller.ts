import type { Request, Response } from 'express';

import * as service from './miscellaneous.service.js';

export async function getGenders(req: Request, res: Response): Promise<void> {
  try {
    const data = await service.getGenders();
    res.build
      .withStatus(200)
      .withModule('miscellaneous')
      .withMessage('Genders retrieved successfully')
      .withData(data)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('GET_GENDERS_FAILED', error.message).fail().send();
  }
}

export async function getMaritalStatuses(req: Request, res: Response): Promise<void> {
  try {
    const data = await service.getMaritalStatuses();
    res.build
      .withStatus(200)
      .withModule('miscellaneous')
      .withMessage('Marital statuses retrieved successfully')
      .withData(data)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('GET_MARITAL_STATUSES_FAILED', error.message).fail().send();
  }
}
