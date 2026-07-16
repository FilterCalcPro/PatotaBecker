import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateTransactionInput, PayFeeInput, UpdateTransactionInput } from "./finance.schema";

export async function listTransactions() {
  return prisma.transaction.findMany({ orderBy: { date: "desc" } });
}

export async function createTransaction(input: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      type: input.type,
      category: input.category,
      description: input.description,
      amount: input.amount,
      date: input.date ? new Date(input.date) : undefined,
    },
  });
}

export async function updateTransaction(id: string, input: UpdateTransactionInput) {
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Lançamento não encontrado");
  }
  return prisma.transaction.update({
    where: { id },
    data: { ...input, date: input.date ? new Date(input.date) : undefined },
  });
}

export async function deleteTransaction(id: string) {
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Lançamento não encontrado");
  }
  await prisma.transaction.delete({ where: { id } });
}

export async function getSummary() {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({ where: { type: "ENTRADA" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "SAIDA" }, _sum: { amount: true } }),
  ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export async function listMonthlyFees(month?: string) {
  return prisma.monthlyFee.findMany({
    where: month ? { referenceMonth: month } : undefined,
    include: { player: true },
    orderBy: [{ referenceMonth: "desc" }, { player: { name: "asc" } }],
  });
}

export async function payMonthlyFee(id: string, input: PayFeeInput) {
  const fee = await prisma.monthlyFee.findUnique({ where: { id }, include: { player: true } });
  if (!fee) {
    throw new ApiError(404, "Mensalidade não encontrada");
  }
  if (fee.status === "PAGO") {
    throw new ApiError(400, "Esta mensalidade já está paga");
  }

  const updated = await prisma.monthlyFee.update({
    where: { id },
    data: { status: "PAGO", method: input.method, paidAt: new Date() },
  });

  await prisma.transaction.create({
    data: {
      type: "ENTRADA",
      category: "MENSALIDADE",
      description: `Mensalidade ${fee.referenceMonth} - ${fee.player.name}`,
      amount: fee.amount,
    },
  });

  return updated;
}
