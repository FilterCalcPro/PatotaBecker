import { Router } from "express";
import { incrementStatHandler, setMatchResultHandler, setMatchStatsHandler } from "./stats.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { incrementStatSchema, setResultSchema, setStatsSchema } from "./stats.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware, requireRole("ADMIN"));

router.post("/:id/stats", validateBody(setStatsSchema), asyncHandler(setMatchStatsHandler));
router.post("/:id/stats/increment", validateBody(incrementStatSchema), asyncHandler(incrementStatHandler));
router.post("/:id/result", validateBody(setResultSchema), asyncHandler(setMatchResultHandler));

export default router;
