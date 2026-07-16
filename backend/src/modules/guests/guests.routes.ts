import { Router } from "express";
import {
  createGuestHandler,
  deleteGuestHandler,
  getGuestHandler,
  listGuestsHandler,
  updateGuestHandler,
} from "./guests.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { createGuestSchema, updateGuestSchema } from "./guests.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(listGuestsHandler));
router.get("/:id", asyncHandler(getGuestHandler));
router.post("/", requireRole("ADMIN"), validateBody(createGuestSchema), asyncHandler(createGuestHandler));
router.put("/:id", requireRole("ADMIN"), validateBody(updateGuestSchema), asyncHandler(updateGuestHandler));
router.delete("/:id", requireRole("ADMIN"), asyncHandler(deleteGuestHandler));

export default router;
