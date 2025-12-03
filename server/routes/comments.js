import { Router } from "express";
import { updateComment, deleteComment } from "../controllers/comments.js";

const router = Router();

router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
