// src/modules/hr-announcement/hr-announcement.routes.ts
import { Router } from "express";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { make_announcement_controllers } from "./hr-announcement.controller.js";
import { db } from "../../config/db.config.js";

export const make_announcement_router = (db: NodePgDatabase<any>): Router => {
  const router = Router();
  const ctrl = make_announcement_controllers(db);

  // ---------------------------------------------------------------------------
  // Announcements
  // ---------------------------------------------------------------------------

  /**
   * GET /api/hr/announcements
   */
  router.get("/announcements", ctrl.list);

  /**
   * GET /api/hr/announcements/employees
   */
  router.get("/announcements/employees", ctrl.get_employees_for_announcement);

  /**
   * GET /api/hr/announcements/:id
   */
  router.get("/announcements/:id", ctrl.get_by_id);

  /**
   * POST /api/hr/announcements
   */
  router.post("/announcements", ctrl.create);

  /**
   * PUT /api/hr/announcements/:id
   */
  router.put("/announcements/:id", ctrl.update);

  /**
   * DELETE /api/hr/announcements/:id
   */
  router.delete("/announcements/:id", ctrl.remove);

  /**
   * POST /api/hr/announcements/:id/authorize
   */
  router.post("/announcements/:id/authorize", ctrl.authorize);

  // ---------------------------------------------------------------------------
  // Notice types (lookup)
  // ---------------------------------------------------------------------------

  /**
   * GET /api/hr/announcement-types
   */
  router.get("/announcement-types", ctrl.list_notice_types);

  /**
   * POST /api/hr/announcement-types
   */
  router.post("/announcement-types", ctrl.create_notice_type);

  return router;
};

// Instantiate and export default router statically
const router = make_announcement_router(db as any);
export default router;
