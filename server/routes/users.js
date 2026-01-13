import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { listUsers, updateUserRole } from "../controllers/users.js";

const router = express.Router();

router.get("/", requireAuth, requireAdmin, listUsers);
router.put("/:id/role", requireAuth, requireAdmin, updateUserRole);

export default router;
