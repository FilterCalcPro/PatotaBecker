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

async function rankByStatSum(field: "goals" | "assists", patotaId: string) {
  const grouped = await prisma.playerMatchStat.groupBy({
    by: ["playerId"],
    where: { playerId: { not: null }, player: { patotaId } },
    _sum: { [field]: true },
  });
  const playerGroups = grouped.filter((g): g is typeof g & { playerId: string } => g.playerId !== null);

  const players = await prisma.player.findMany({ where: { id: { in: playerGroups.map((g) => g.playerId) }, patotaId } });
  const playerById = new Map(players.map((p) => [p.id, p]));

  return playerGroups
    .map((g) => ({ player: playerById.get(g.playerId), value: (g._sum[field] as number) ?? 0 }))
    .filter((entry) => entry.player)
    .sort((a, b) => b.value - a.value);
}

async function rankByVoteCount(category: "MVP" | "ARTILHEIRO" | "GOLEIRO", patotaId: string, rankFilter?: number) {
  const grouped = await prisma.vote.groupBy({
    by: ["candidateId"],
    where: { category, candidate: { patotaId }, ...(rankFilter ? { rank: rankFilter } : {}) },
    _count: { _all: true },
  });

  const players = await prisma.player.findMany({ where: { id: { in: grouped.map((g) => g.candidateId) }, patotaId } });
  const playerById = new Map(players.map((p) => [p.id, p]));

  return grouped
    .map((g) => ({ player: playerById.get(g.candidateId), value: g._count._all }))
    .filter((entry) => entry.player)
    .sort((a, b) => b.value - a.value);
}

async function rankByPresences(patotaId: string) {
  const grouped = await prisma.attendance.groupBy({
    by: ["playerId"],
    where: { attended: true, player: { patotaId } },
    _count: { _all: true },
  });

  const players = await prisma.player.findMany({ where: { id: { in: grouped.map((g) => g.playerId) }, patotaId } });
  const playerById = new Map(players.map((p) => [p.id, p]));

  return grouped
    .map((g) => ({ player: playerById.get(g.playerId), value: g._count._all }))
    .filter((entry) => entry.player)
    .sort((a, b) => b.value - a.value);
}

async function rankByStreak(patotaId: string) {
  const players = await prisma.player.findMany({ where: { patotaId } });
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

function rankByOverall(patotaId: string) {
  return prisma.player
    .findMany({ where: { patotaId }, orderBy: { overall: "desc" } })
    .then((players) => players.map((player) => ({ player, value: player.overall })));
}

export async function getRanking(type: RankingType, patotaId: string) {
  switch (type) {
    case "goals":
      return rankByStatSum("goals", patotaId);
    case "assists":
      return rankByStatSum("assists", patotaId);
    case "mvp":
      return rankByVoteCount("MVP", patotaId, 1);
    case "top-scorer":
      return rankByVoteCount("ARTILHEIRO", patotaId);
    case "best-gk":
      return rankByVoteCount("GOLEIRO", patotaId);
    case "presences":
      return rankByPresences(patotaId);
    case "streak":
      return rankByStreak(patotaId);
    case "overall":
      return rankByOverall(patotaId);
    default:
      throw new ApiError(400, "Tipo de ranking inválido");
  }
}
