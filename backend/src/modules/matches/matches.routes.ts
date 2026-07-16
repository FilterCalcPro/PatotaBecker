import { Router } from "express";
import {
  addGuestToMatchHandler,
  closeMatchHandler,
  createMatchHandler,
  deleteMatchHandler,
  getMatchHandler,
  listMatchesHandler,
  recalculateMatchHandler,
  removeGuestFromMatchHandler,
  setGuestPaidHandler,
  startMatchHandler,
  updateMatchHandler,
} from "./matches.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { createMatchSchema, updateMatchSchema } from "./matches.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(listMatchesHandler));
router.get("/:id", asyncHandler(getMatchHandler));
router.post("/", requireRole("ADMIN"), validateBody(createMatchSchema), asyncHandler(createMatchHandler));
router.put("/:id", requireRole("ADMIN"), validateBody(updateMatchSchema), asyncHandler(updateMatchHandler));
router.delete("/:id", requireRole("ADMIN"), asyncHandler(deleteMatchHandler));
router.post("/:id/close", requireRole("ADMIN"), asyncHandler(closeMatchHandler));
router.post("/:id/start", requireRole("ADMIN"), asyncHandler(startMatchHandler));
router.post("/:id/recalculate", requireRole("ADMIN"), asyncHandler(recalculateMatchHandler));

router.post("/:id/guests", requireRole("ADMIN"), asyncHandler(addGuestToMatchHandler));
router.patch("/:id/guests/:guestId/pay", requireRole("ADMIN"), asyncHandler(setGuestPaidHandler));
router.delete("/:id/guests/:guestId", requireRole("ADMIN"), asyncHandler(removeGuestFromMatchHandler));

export default router;
