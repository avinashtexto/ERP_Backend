// src/modules/hr-announcement/hr-announcement.controller.ts
import type { Request, Response } from "express";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  create_announcement_dto,
  update_announcement_dto,
  authorize_announcement_dto,
  delete_announcement_dto,
  list_announcement_dto,
  create_notice_type_dto,
} from "./hr-announcement.dto.js";

import * as svc from "./hr-announcement.service.js";

// ---------------------------------------------------------------------------
// Factory: inject DB dependency via closure (functional DI pattern)
// ---------------------------------------------------------------------------
export const make_announcement_controllers = (db: NodePgDatabase<any>) => {

  // -------------------------------------------------------------------------
  // GET /announcements
  // -------------------------------------------------------------------------
  const list = async (req: Request, res: Response): Promise<void> => {
    const parsed = list_announcement_dto.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ ok: false, errors: parsed.error.flatten() });
      return;
    }

    const { page, page_size, ...filter } = parsed.data;
    const result = await svc.list_announcements(db, filter, { page, page_size });

    if (!result.ok) {
      res.status(500).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, ...result.data });
  };

  // -------------------------------------------------------------------------
  // GET /announcements/:id
  // -------------------------------------------------------------------------
  const get_by_id = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ ok: false, error: "Invalid ID." });
      return;
    }

    const result = await svc.get_announcement_by_id(db, id);

    if (!result.ok) {
      res.status(404).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, data: result.data });
  };

  // -------------------------------------------------------------------------
  // POST /announcements
  // -------------------------------------------------------------------------
  const create = async (req: Request, res: Response): Promise<void> => {
    const parsed = create_announcement_dto.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, errors: parsed.error.flatten() });
      return;
    }

    const result = await svc.create_announcement(db, parsed.data);

    if (!result.ok) {
      res.status(422).json({ ok: false, error: result.error });
      return;
    }

    res.status(201).json({ ok: true, data: result.data });
  };

  // -------------------------------------------------------------------------
  // PUT /announcements/:id
  // -------------------------------------------------------------------------
  const update = async (req: Request, res: Response): Promise<void> => {
    const pk_an_id = Number(req.params.id);
    if (!Number.isInteger(pk_an_id) || pk_an_id < 1) {
      res.status(400).json({ ok: false, error: "Invalid ID." });
      return;
    }

    const parsed = update_announcement_dto.safeParse({
      ...req.body,
      pk_an_id,
    });

    if (!parsed.success) {
      res.status(400).json({ ok: false, errors: parsed.error.flatten() });
      return;
    }

    const result = await svc.update_announcement(db, parsed.data);

    if (!result.ok) {
      res.status(422).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, data: result.data });
  };

  // -------------------------------------------------------------------------
  // DELETE /announcements/:id
  // -------------------------------------------------------------------------
  const remove = async (req: Request, res: Response): Promise<void> => {
    const pk_an_id = Number(req.params.id);
    if (!Number.isInteger(pk_an_id) || pk_an_id < 1) {
      res.status(400).json({ ok: false, error: "Invalid ID." });
      return;
    }

    const parsed = delete_announcement_dto.safeParse({
      pk_an_id,
      ref_no: req.body.ref_no ?? "",
    });

    if (!parsed.success) {
      res.status(400).json({ ok: false, errors: parsed.error.flatten() });
      return;
    }

    // The requesting user ID should come from auth middleware
    const fk_user_id: string = String((req as any).user?.id ?? "1");

    const result = await svc.delete_announcement(db, parsed.data, fk_user_id);

    if (!result.ok) {
      res.status(422).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, data: result.data });
  };

  // -------------------------------------------------------------------------
  // POST /announcements/:id/authorize
  // -------------------------------------------------------------------------
  const authorize = async (req: Request, res: Response): Promise<void> => {
    const pk_an_id = Number(req.params.id);

    const parsed = authorize_announcement_dto.safeParse({
      pk_an_id,
      ...req.body,
    });

    if (!parsed.success) {
      res.status(400).json({ ok: false, errors: parsed.error.flatten() });
      return;
    }

    const result = await svc.authorize_announcement(db, parsed.data);

    if (!result.ok) {
      res.status(422).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, data: result.data });
  };

  // -------------------------------------------------------------------------
  // GET /announcement-types
  // -------------------------------------------------------------------------
  const list_notice_types = async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    const result = await svc.list_notice_types(db);

    if (!result.ok) {
      res.status(500).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, data: result.data });
  };

  // -------------------------------------------------------------------------
  // POST /announcement-types
  // -------------------------------------------------------------------------
  const create_notice_type = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const parsed = create_notice_type_dto.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, errors: parsed.error.flatten() });
      return;
    }

    const result = await svc.create_notice_type(db, parsed.data);

    if (!result.ok) {
      res.status(422).json({ ok: false, error: result.error });
      return;
    }

    res.status(201).json({ ok: true, data: result.data });
  };

  // -------------------------------------------------------------------------
  // GET /announcements/employees
  // -------------------------------------------------------------------------
  const get_employees_for_announcement = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const ref_date_str = req.query.ref_date as string;
    const ref_date = ref_date_str ? new Date(ref_date_str) : new Date();
    const pk_an_id = req.query.pk_an_id ? Number(req.query.pk_an_id) : null;

    const result = await svc.get_employees_for_announcement(db, ref_date, pk_an_id);

    if (!result.ok) {
      res.status(500).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, data: result.data });
  };

  return {
    list,
    get_by_id,
    create,
    update,
    remove,
    authorize,
    list_notice_types,
    create_notice_type,
    get_employees_for_announcement,
  };
};

export type AnnouncementControllers = ReturnType<
  typeof make_announcement_controllers
>;
