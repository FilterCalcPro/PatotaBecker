import { Router } from "express";
import { listAchievementsHandler } from "./achievements.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);
router.get("/", asyncHandler(listAchievementsHandler));

export default router;
