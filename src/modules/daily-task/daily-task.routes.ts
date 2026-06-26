import { Router } from 'express';
import {
  listDailyTasks,
  getDailyTask,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
} from './daily-task.controller.js';

/**
 * Daily Task Router
 *
 * GET    /daily-tasks              → paginated list with filters
 * POST   /daily-tasks              → create new task
 * GET    /daily-tasks/:id          → get single task
 * PUT    /daily-tasks/:id          → update task
 * DELETE /daily-tasks/:id          → delete task
 */

const router = Router();

// ── CRUD ────────────────────────────────────────────────────
router.get('/', listDailyTasks);
router.post('/', createDailyTask);

router.get('/:id', getDailyTask);
router.put('/:id', updateDailyTask);
router.delete('/:id', deleteDailyTask);

export default router;
