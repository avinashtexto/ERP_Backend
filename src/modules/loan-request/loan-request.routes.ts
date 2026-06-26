import { Router } from "express";
import * as controller from "./loan-request.controller.js";

const router = Router();

// Static routes must come BEFORE dynamic "/:id" parameters
router.get("/employees", controller.getEmployees);
router.post("/calculate", controller.calculateEMI);

// CRUD
router.get("/", controller.listLoans);
router.post("/", controller.createLoan);

router.get("/:id", controller.getLoan);
router.put("/:id", controller.updateLoan);
router.delete("/:id", controller.deleteLoan);

// Action sub-routes
router.post("/:id/authorize", controller.authorizeLoan);

export default router;
