import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

export type RankingType =
  | "goals"
  | "assists"
  | "mvp"
  | "top-scorer"
  | "best-gk"
  | "presences"
  | "streak"
  | "overall";

async function rankByStatSum(field: "goals" | "assists") {
  const grouped = await prisma.playerMatchStat.groupBy({
    by: ["playerId"],
    where: { playerId: { not: null } },
    _sum: { [field]: true },
  });
  const playerGroups = grouped.filter((g): g is typeof g & { playerId: string } => g.playerId !== null);

  const players = await prisma.player.findMany({ where: { id: { in: playerGroups.map((g) => g.playerId) } } });
  const playerById = new Map(players.map((p) => [p.id, p]));

  return playerGroups
    .map((g) => ({ player: playerById.get(g.playerId), value: (g._sum[field] as number) ?? 0 }))
    .filter((entry) => entry.player)
    .sort((a, b) => b.value - a.value);
}

async function rankByVoteCount(category: "MVP" | "ARTILHEIRO" | "GOLEIRO", rankFilter?: number) {
  const grouped = await prisma.vote.groupBy({
    by: ["candidateId"],
    where: { category, ...(rankFilter ? { rank: rankFilter } : {}) },
    _count: { _all: true },
  });

  const players = await prisma.player.findMany({ where: { id: { in: grouped.map((g) => g.candidateId) } } });
  const playerById = new Map(players.map((p) => [p.id, p]));

  return grouped
    .map((g) => ({ player: playerById.get(g.candidateId), value: g._count._all }))
    .filter((entry) => entry.player)
    .sort((a, b) => b.value - a.value);
}

async function rankByPresences() {
  const grouped = await prisma.attendance.groupBy({
    by: ["playerId"],
    where: { attended: true },
    _count: { _all: true },
  });

  const players = await prisma.player.findMany({ where: { id: { in: grouped.map((g) => g.playerId) } } });
  const playerById = new Map(players.map((p) => [p.id, p]));

  return grouped
    .map((g) => ({ player: playerById.get(g.playerId), value: g._count._all }))
    .filter((entry) => entry.player)
    .sort((a, b) => b.value - a.value);
}

async function rankByStreak() {
  const players = await prisma.player.findMany();
  const results = await Promise.all(
    players.map(async (player) => {
      const attendances = await prisma.attendance.findMany({
        where: { playerId: player.id, match: { date: { lte: new Date() } } },
        orderBy: { match: { date: "desc" } },
        include: { match: true },
      });
      let streak = 0;
      for (const attendance of attendances) {
        if (attendance.attended) streak += 1;
        else break;
      }
      return { player, value: streak };
    })
  );
  return results.sort((a, b) => b.value - a.value);
}

function rankByOverall() {
  return prisma.player
    .findMany({ orderBy: { overall: "desc" } })
    .then((players) => players.map((player) => ({ player, value: player.overall })));
}

export async function getRanking(type: RankingType) {
  switch (type) {
    case "goals":
      return rankByStatSum("goals");
    case "assists":
      return rankByStatSum("assists");
    case "mvp":
      return rankByVoteCount("MVP", 1);
    case "top-scorer":
      return rankByVoteCount("ARTILHEIRO");
    case "best-gk":
      return rankByVoteCount("GOLEIRO");
    case "presences":
      return rankByPresences();
    case "streak":
      return rankByStreak();
    case "overall":
      return rankByOverall();
    default:
      throw new ApiError(400, "Tipo de ranking inválido");
  }
}
