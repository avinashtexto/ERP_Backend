import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { getCountryDropdown } from './country.service.js';

const MODULE = 'country';

export const getDropdown = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const data = await getCountryDropdown();
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Country dropdown retrieved successfully')
    .withData(data)
    .success()
    .send();
});
