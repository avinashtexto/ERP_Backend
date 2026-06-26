import { Router } from 'express';

import {
  listLeaveRequests,
  getLeaveRequest,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  authorizeLeaveRequest,
  getLeaveBalance,
  getEmployees,
  getLeaveTypes,
  updateLeaveBalance,
} from './leave-request.controller.js';

/**
 * Leave Request Router
 *
 * GET    /leave-requests                  → paginated list with filters
 * POST   /leave-requests                  → create new request
 * GET    /leave-requests/balance          → employee leave balance
 * GET    /leave-requests/employees        → employee dropdown data
 * GET    /leave-requests/leave-types      → leave type dropdown data
 * POST   /leave-requests/update-balance   → update leave balance for all employees
 * GET    /leave-requests/:id              → get single request with details
 * PUT    /leave-requests/:id              → update request
 * DELETE /leave-requests/:id              → delete request
 * POST   /leave-requests/:id/authorize    → authorize / reject
 */

const router = Router();

// ── Static sub-paths must come BEFORE /:id ──────────────────
router.get('/balance', getLeaveBalance);
router.get('/employees', getEmployees);
router.get('/leave-types', getLeaveTypes);
router.post('/update-balance', updateLeaveBalance);

// ── CRUD ────────────────────────────────────────────────────
router.get('/', listLeaveRequests);
router.post('/', createLeaveRequest);

router.get('/:id', getLeaveRequest);
router.put('/:id', updateLeaveRequest);
router.delete('/:id', deleteLeaveRequest);

// ── Authorization sub-action ─────────────────────────────────
router.post('/:id/authorize', authorizeLeaveRequest);

export default router;
