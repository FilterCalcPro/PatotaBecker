import { Router } from "express";
import { autoBalanceHandler, clearTeamsHandler, getTeamsHandler, saveTeamsHandler } from "./teams.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { saveTeamsSchema } from "./teams.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.get("/:id/teams", asyncHandler(getTeamsHandler));
router.put("/:id/teams", requireRole("ADMIN"), validateBody(saveTeamsSchema), asyncHandler(saveTeamsHandler));
router.post("/:id/teams/balance", requireRole("ADMIN"), asyncHandler(autoBalanceHandler));
router.delete("/:id/teams", requireRole("ADMIN"), asyncHandler(clearTeamsHandler));

export default router;
