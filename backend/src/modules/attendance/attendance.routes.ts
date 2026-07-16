import { Router } from "express";
import { checkinAttendanceHandler, overrideAttendanceHandler, setOwnAttendanceHandler } from "./attendance.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { setAttendanceSchema } from "./attendance.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.post("/:id/attendance", validateBody(setAttendanceSchema), asyncHandler(setOwnAttendanceHandler));
router.patch(
  "/:id/attendance/:playerId",
  requireRole("ADMIN"),
  validateBody(setAttendanceSchema),
  asyncHandler(overrideAttendanceHandler)
);
router.post("/:id/attendance/:playerId/checkin", requireRole("ADMIN"), asyncHandler(checkinAttendanceHandler));

export default router;
