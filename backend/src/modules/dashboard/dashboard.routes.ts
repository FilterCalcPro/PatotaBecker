import { Router } from "express";
import { getAdminDashboardHandler, getPlayerDashboardHandler } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.get("/admin", requireRole("ADMIN"), asyncHandler(getAdminDashboardHandler));
router.get("/player/:id", asyncHandler(getPlayerDashboardHandler));

export default router;
