import { Router } from "express";
import { castVoteHandler, getMyVoteHandler, getVoteResultsHandler } from "./voting.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { castVoteSchema } from "./voting.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.post("/:id/votes", validateBody(castVoteSchema), asyncHandler(castVoteHandler));
router.get("/:id/votes/results", asyncHandler(getVoteResultsHandler));
router.get("/:id/votes/me", asyncHandler(getMyVoteHandler));

export default router;
