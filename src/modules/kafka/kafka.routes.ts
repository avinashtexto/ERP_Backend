import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { publishEvent } from '../../config/kafka.config.js';

export const kafkaRouter = Router();

/**
 * @openapi
 * /api/kafka/publish:
 *   post:
 *     tags:
 *       - Kafka Testing
 *     summary: Publish a test message to a Kafka topic
 *     description: Publishes a JSON payload to the specified Kafka topic for testing.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic, payload]
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "tionix-erp-events"
 *               payload:
 *                 type: object
 *                 example: { message: "Hello from ERP System!" }
 *     responses:
 *       200:
 *         description: Message published successfully
 *       400:
 *         description: Invalid parameters or failed to publish
 */
kafkaRouter.post(
  '/publish',
  asyncHandler(async (req, res) => {
    const { topic, payload } = req.body;
    if (!topic || !payload) {
      res.build
        .withStatus(400)
        .withModule('kafka')
        .withError('BAD_REQUEST', 'Topic and payload are required')
        .fail()
        .send();
      return;
    }

    const success = await publishEvent(topic, payload);
    if (success) {
      res.build
        .withStatus(200)
        .withModule('kafka')
        .withMessage('Message published successfully')
        .success()
        .send();
    } else {
      res.build
        .withStatus(500)
        .withModule('kafka')
        .withMessage('Failed to publish event to Kafka')
        .withError('INTERNAL_ERROR', 'Failed to publish event to Kafka')
        .fail()
        .send();
    }
  }),
);
