import { Router } from "express";
import {
  createTransactionHandler,
  deleteTransactionHandler,
  getSummaryHandler,
  listMonthlyFeesHandler,
  listTransactionsHandler,
  payMonthlyFeeHandler,
  updateTransactionHandler,
} from "./finance.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { createTransactionSchema, payFeeSchema, updateTransactionSchema } from "./finance.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.get("/summary", requireRole("ADMIN"), asyncHandler(getSummaryHandler));
router.get("/transactions", requireRole("ADMIN"), asyncHandler(listTransactionsHandler));
router.post(
  "/transactions",
  requireRole("ADMIN"),
  validateBody(createTransactionSchema),
  asyncHandler(createTransactionHandler)
);
router.put(
  "/transactions/:id",
  requireRole("ADMIN"),
  validateBody(updateTransactionSchema),
  asyncHandler(updateTransactionHandler)
);
router.delete("/transactions/:id", requireRole("ADMIN"), asyncHandler(deleteTransactionHandler));

router.get("/monthly-fees", asyncHandler(listMonthlyFeesHandler));
router.patch(
  "/monthly-fees/:id/pay",
  requireRole("ADMIN"),
  validateBody(payFeeSchema),
  asyncHandler(payMonthlyFeeHandler)
);

export default router;
