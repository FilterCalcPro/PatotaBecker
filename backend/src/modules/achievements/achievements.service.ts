import { prisma } from "../../lib/prisma";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export async function listAchievements() {
  return prisma.achievement.findMany({ orderBy: { name: "asc" } });
}

async function unlock(playerId: string, code: string) {
  const achievement = await prisma.achievement.findUnique({ where: { code } });
  if (!achievement) return;

  await prisma.playerAchievement.upsert({
    where: { playerId_achievementId: { playerId, achievementId: achievement.id } },
    update: {},
    create: { playerId, achievementId: achievement.id },
  });
}

export async function checkAndUnlockAchievements(playerId: string) {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return;

  const [statsAgg, presenceCount, mvpWins, topScorerWins, bestGkWins, recentFees] = await Promise.all([
    prisma.playerMatchStat.aggregate({ where: { playerId }, _sum: { goals: true, assists: true } }),
    prisma.attendance.count({ where: { playerId, attended: true } }),
    prisma.vote.count({ where: { candidateId: playerId, category: "MVP", rank: 1 } }),
    prisma.vote.count({ where: { candidateId: playerId, category: "ARTILHEIRO" } }),
    prisma.vote.count({ where: { candidateId: playerId, category: "GOLEIRO" } }),
    prisma.monthlyFee.findMany({ where: { playerId }, orderBy: { referenceMonth: "desc" }, take: 6 }),
  ]);

  const goals = statsAgg._sum.goals ?? 0;
  const assists = statsAgg._sum.assists ?? 0;

  if (goals >= 50) await unlock(playerId, "50_GOALS");
  if (assists >= 50) await unlock(playerId, "50_ASSISTS");
  if (presenceCount >= 20) await unlock(playerId, "20_PRESENCES");
  if (mvpWins >= 10) await unlock(playerId, "10_MVP");
  if (topScorerWins >= 10) await unlock(playerId, "10_TOP_SCORER");
  if (bestGkWins >= 10) await unlock(playerId, "10_BEST_GK");

  if (Date.now() - player.joinedAt.getTime() >= ONE_YEAR_MS) {
    await unlock(playerId, "VETERAN");
  }

  if (recentFees.length === 6 && recentFees.every((fee) => fee.status === "PAGO")) {
    await unlock(playerId, "PUNCTUAL_PAYER");
  }
}
