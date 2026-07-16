import { api } from "./api";
import { MonthlyFee, PaymentMethod, Transaction, TransactionType } from "@/types";

export async function listTransactions() {
  const { data } = await api.get<Transaction[]>("/finance/transactions");
  return data;
}

export async function createTransaction(payload: {
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
}) {
  const { data } = await api.post<Transaction>("/finance/transactions", payload);
  return data;
}

export async function deleteTransaction(id: string) {
  await api.delete(`/finance/transactions/${id}`);
}

export async function getSummary() {
  const { data } = await api.get<{ totalIncome: number; totalExpense: number; balance: number }>("/finance/summary");
  return data;
}

export async function listMonthlyFees(month?: string) {
  const { data } = await api.get<MonthlyFee[]>("/finance/monthly-fees", { params: month ? { month } : undefined });
  return data;
}

export async function payMonthlyFee(id: string, method: PaymentMethod) {
  const { data } = await api.patch<MonthlyFee>(`/finance/monthly-fees/${id}/pay`, { method });
  return data;
}
