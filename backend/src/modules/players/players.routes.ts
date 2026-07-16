import { Router } from "express";
import {
  createLoginHandler,
  createPlayerHandler,
  deletePlayerHandler,
  getPlayerAchievementsHandler,
  getPlayerHandler,
  getPlayerOverallHistoryHandler,
  getPlayerStatsHandler,
  listPlayersHandler,
  resetPasswordHandler,
  updatePlayerHandler,
  updatePlayerStatusHandler,
} from "./players.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import {
  createLoginSchema,
  createPlayerSchema,
  resetPasswordSchema,
  updatePlayerSchema,
  updateStatusSchema,
} from "./players.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(listPlayersHandler));
router.get("/:id", asyncHandler(getPlayerHandler));
router.get("/:id/stats", asyncHandler(getPlayerStatsHandler));
router.get("/:id/overall-history", asyncHandler(getPlayerOverallHistoryHandler));
router.get("/:id/achievements", asyncHandler(getPlayerAchievementsHandler));

router.post("/", requireRole("ADMIN"), validateBody(createPlayerSchema), asyncHandler(createPlayerHandler));
router.put("/:id", validateBody(updatePlayerSchema), asyncHandler(updatePlayerHandler));
router.patch("/:id/status", requireRole("ADMIN"), validateBody(updateStatusSchema), asyncHandler(updatePlayerStatusHandler));
router.post("/:id/login", requireRole("ADMIN"), validateBody(createLoginSchema), asyncHandler(createLoginHandler));
router.patch("/:id/password", requireRole("ADMIN"), validateBody(resetPasswordSchema), asyncHandler(resetPasswordHandler));
router.delete("/:id", requireRole("ADMIN"), asyncHandler(deletePlayerHandler));

export default router;
