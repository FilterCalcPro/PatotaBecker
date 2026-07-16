import { Router } from "express";
import { listNotificationsHandler, markAsReadHandler } from "./notifications.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);
router.get("/", asyncHandler(listNotificationsHandler));
router.patch("/:id/read", asyncHandler(markAsReadHandler));

export default router;
