import { prisma } from "../../lib/prisma";
import { startOfToday } from "../../utils/constants";

export async function getTvPanel() {
  const [nextMatch, income, expense, topScorers, topAssists, topOverall] = await Promise.all([
    prisma.match.findFirst({
      where: { date: { gte: startOfToday() }, closed: false },
      orderBy: { date: "asc" },
      include: { attendances: true },
    }),
    prisma.transaction.aggregate({ where: { type: "ENTRADA" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "SAIDA" }, _sum: { amount: true } }),
    prisma.playerMatchStat.groupBy({
      by: ["playerId"],
      where: { playerId: { not: null } },
      _sum: { goals: true },
      orderBy: { _sum: { goals: "desc" } },
      take: 5,
    }),
    prisma.playerMatchStat.groupBy({
      by: ["playerId"],
      where: { playerId: { not: null } },
      _sum: { assists: true },
      orderBy: { _sum: { assists: "desc" } },
      take: 5,
    }),
    prisma.player.findMany({ orderBy: { overall: "desc" }, take: 5 }),
  ]);

  const scorerIds = topScorers.map((s) => s.playerId).filter((id): id is string => id !== null);
  const assistIds = topAssists.map((s) => s.playerId).filter((id): id is string => id !== null);
  const players = await prisma.player.findMany({ where: { id: { in: [...scorerIds, ...assistIds] } } });
  const playerById = new Map(players.map((p) => [p.id, p]));

  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;

  let confirmed = 0;
  if (nextMatch) {
    confirmed = nextMatch.attendances.filter((a) => a.status === "CONFIRMADO").length;
  }

  return {
    nextMatch: nextMatch
      ? {
          date: nextMatch.date,
          time: nextMatch.time,
          location: nextMatch.location,
          format: nextMatch.format,
          confirmed,
        }
      : null,
    balance: totalIncome - totalExpense,
    topScorers: topScorers.map((s) => ({ player: s.playerId ? playerById.get(s.playerId) : undefined, goals: s._sum.goals ?? 0 })),
    topAssists: topAssists.map((s) => ({ player: s.playerId ? playerById.get(s.playerId) : undefined, assists: s._sum.assists ?? 0 })),
    topOverall,
  };
}
