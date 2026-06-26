import { Router } from "express";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  authorizeRequest,
  deleteRequest,
  getShiftEndTimeForEmployee,
} from "./personal-work.controller.js";

const router = Router();

router.get("/shift-end", authenticate, getShiftEndTimeForEmployee);
router.get("/", authenticate, listRequests);
router.post("/", authenticate, createRequest);
router.get("/:id", authenticate, getRequest);
router.put("/:id", authenticate, updateRequest);
router.post("/:id/authorize", authenticate, authorizeRequest);
router.delete("/:id", authenticate, deleteRequest);

export default router;
