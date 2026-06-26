import type { Request, Response } from 'express';

import * as service from './area-region-shipping-location.service.js';

export async function health(req: Request, res: Response): Promise<void> {
  try {
    const data = await service.health();
    res.build
      .withStatus(200)
      .withModule('area-region-shipping-location')
      .withMessage('AreaRegionShippingLocation health check successful')
      .withData(data)
      .success()
      .send();
  } catch (error: any) {
    res.build.withStatus(500).withError('HEALTH_CHECK_FAILED', error.message).fail().send();
  }
}
