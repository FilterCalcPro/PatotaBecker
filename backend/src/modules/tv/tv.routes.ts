import { Router } from "express";
import { getTvPanelHandler } from "./tv.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/panel", asyncHandler(getTvPanelHandler));

export default router;
