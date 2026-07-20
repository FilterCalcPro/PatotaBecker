import { Request, Response } from "express";
import * as financeService from "./finance.service";
import { ApiError } from "../../utils/ApiError";

export async function listTransactionsHandler(req: Request, res: Response) {
  if (!req.auth) throw new ApiError(401, "Não autenticado");
  res.json(await financeService.listTransactions(req.auth.patotaId));
}

export async function createTransactionHandler(req: Request, res: Response) {
  if (!req.auth) throw new ApiError(401, "Não autenticado");
  res.status(201).json(await financeService.createTransaction(req.body, req.auth.patotaId));
}

export async function updateTransactionHandler(req: Request, res: Response) {
  res.json(await financeService.updateTransaction(req.params.id, req.body));
}

export async function deleteTransactionHandler(req: Request, res: Response) {
  await financeService.deleteTransaction(req.params.id);
  res.status(204).send();
}

export async function getSummaryHandler(req: Request, res: Response) {
  if (!req.auth) throw new ApiError(401, "Não autenticado");
  res.json(await financeService.getSummary(req.auth.patotaId));
}

export async function listMonthlyFeesHandler(req: Request, res: Response) {
  if (!req.auth) throw new ApiError(401, "Não autenticado");
  res.json(await financeService.listMonthlyFees(req.auth.patotaId, req.query.month as string | undefined));
}

export async function payMonthlyFeeHandler(req: Request, res: Response) {
  if (!req.auth) throw new ApiError(401, "Não autenticado");
  res.json(await financeService.payMonthlyFee(req.params.id, req.body, req.auth.patotaId));
}
