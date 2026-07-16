import { Router } from "express";
import {
  approveWaitlistHandler,
  createWaitlistHandler,
  deleteWaitlistHandler,
  listWaitlistHandler,
} from "./waitlist.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { approveWaitlistSchema, createWaitlistSchema } from "./waitlist.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/", validateBody(createWaitlistSchema), asyncHandler(createWaitlistHandler));

router.get("/", authMiddleware, requireRole("ADMIN"), asyncHandler(listWaitlistHandler));
router.patch(
  "/:id/approve",
  authMiddleware,
  requireRole("ADMIN"),
  validateBody(approveWaitlistSchema),
  asyncHandler(approveWaitlistHandler)
);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncHandler(deleteWaitlistHandler));

export default router;
