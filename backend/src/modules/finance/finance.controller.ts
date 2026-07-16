import { Request, Response } from "express";
import * as financeService from "./finance.service";

export async function listTransactionsHandler(_req: Request, res: Response) {
  res.json(await financeService.listTransactions());
}

export async function createTransactionHandler(req: Request, res: Response) {
  res.status(201).json(await financeService.createTransaction(req.body));
}

export async function updateTransactionHandler(req: Request, res: Response) {
  res.json(await financeService.updateTransaction(req.params.id, req.body));
}

export async function deleteTransactionHandler(req: Request, res: Response) {
  await financeService.deleteTransaction(req.params.id);
  res.status(204).send();
}

export async function getSummaryHandler(_req: Request, res: Response) {
  res.json(await financeService.getSummary());
}

export async function listMonthlyFeesHandler(req: Request, res: Response) {
  res.json(await financeService.listMonthlyFees(req.query.month as string | undefined));
}

export async function payMonthlyFeeHandler(req: Request, res: Response) {
  res.json(await financeService.payMonthlyFee(req.params.id, req.body));
}
