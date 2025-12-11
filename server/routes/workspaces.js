import { Router } from "express";
import {
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceById,
} from "../controllers/workspaces.js";

const router = Router();

router.get("/", listWorkspaces);
router.get("/:id", getWorkspaceById);
router.post("/", createWorkspace);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

export default router;
