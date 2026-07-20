import { Router } from "express";
import { getRankingHandler } from "./rankings.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);
router.get("/:type", asyncHandler(getRankingHandler));

export default router;
