import { prisma } from "../../lib/prisma";
import { startOfToday } from "../../utils/constants";

async function getNextMatch() {
  return prisma.match.findFirst({
    where: { date: { gte: startOfToday() }, closed: false },
    orderBy: { date: "asc" },
    include: { attendances: { include: { player: true } } },
  });
}

export async function getAdminDashboard() {
  const nextMatch = await getNextMatch();

  let confirmed = 0;
  let declined = 0;
  let pending = 0;
  if (nextMatch) {
    for (const attendance of nextMatch.attendances) {
      if (attendance.status === "CONFIRMADO") confirmed += 1;
      else if (attendance.status === "RECUSADO") declined += 1;
      else pending += 1;
    }
  }

  const [income, expense, topOverall, lastMatches, lastTransactions] = await Promise.all([
    prisma.transaction.aggregate({ where: { type: "ENTRADA" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "SAIDA" }, _sum: { amount: true } }),
    prisma.player.findMany({ orderBy: { overall: "desc" }, take: 5 }),
    prisma.match.findMany({ orderBy: { date: "desc" }, take: 5, include: { result: true } }),
    prisma.transaction.findMany({ orderBy: { date: "desc" }, take: 8 }),
  ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;

  return {
    nextMatch: nextMatch
      ? {
          id: nextMatch.id,
          date: nextMatch.date,
          time: nextMatch.time,
          location: nextMatch.location,
          format: nextMatch.format,
          confirmed,
          declined,
          pending,
        }
      : null,
    finance: { totalIncome, totalExpense, balance: totalIncome - totalExpense },
    topOverall,
    lastMatches,
    lastTransactions,
  };
}

export async function getPlayerDashboard(playerId: string) {
  const nextMatch = await getNextMatch();
  const myAttendance = nextMatch
    ? await prisma.attendance.findUnique({ where: { matchId_playerId: { matchId: nextMatch.id, playerId } } })
    : null;

  const player = await prisma.player.findUnique({ where: { id: playerId } });

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const currentFee = await prisma.monthlyFee.findUnique({
    where: { playerId_referenceMonth: { playerId, referenceMonth: currentMonth } },
  });

  return {
    player,
    nextMatch: nextMatch
      ? {
          id: nextMatch.id,
          date: nextMatch.date,
          time: nextMatch.time,
          location: nextMatch.location,
          format: nextMatch.format,
          myStatus: myAttendance?.status ?? "PENDENTE",
        }
      : null,
    currentMonthlyFee: currentFee,
  };
}
