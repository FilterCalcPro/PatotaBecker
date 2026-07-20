import { Router } from "express";
import { loginHandler, meHandler } from "./auth.controller";
import { validateBody } from "../../middlewares/validate.middleware";
import { loginSchema } from "./auth.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/login", validateBody(loginSchema), asyncHandler(loginHandler));
router.get("/me", authMiddleware, asyncHandler(meHandler));

export default router;
