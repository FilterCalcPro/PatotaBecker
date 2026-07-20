import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { IncrementStatInput, SetResultInput, SetStatsInput } from "./stats.schema";

export async function setMatchStats(matchId: string, input: SetStatsInput) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new ApiError(404, "Jogo não encontrado");
  }

  await prisma.$transaction(
    input.stats.map((stat) =>
      prisma.playerMatchStat.upsert({
        where: { matchId_playerId: { matchId, playerId: stat.playerId } },
        update: { goals: stat.goals, assists: stat.assists },
        create: { matchId, playerId: stat.playerId, goals: stat.goals, assists: stat.assists },
      })
    )
  );

  return prisma.playerMatchStat.findMany({ where: { matchId }, include: { player: true } });
}

export async function incrementStat(matchId: string, input: IncrementStatInput) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new ApiError(404, "Jogo não encontrado");
  }

  const where = input.playerId
    ? { matchId_playerId: { matchId, playerId: input.playerId } }
    : { matchId_guestId: { matchId, guestId: input.guestId! } };

  const existing = await prisma.playerMatchStat.findUnique({ where });
  const currentValue = existing?.[input.field] ?? 0;
  const nextValue = Math.max(0, currentValue + input.delta);

  const stat = await prisma.playerMatchStat.upsert({
    where,
    update: { [input.field]: nextValue },
    create: {
      matchId,
      playerId: input.playerId,
      guestId: input.guestId,
      [input.field]: nextValue,
    },
    include: { player: true, guest: true },
  });

  if (input.playerId) {
    await prisma.attendance.updateMany({
      where: { matchId, playerId: input.playerId },
      data: { attended: true },
    });
  }

  return stat;
}

export async function setMatchResult(matchId: string, input: SetResultInput) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new ApiError(404, "Jogo não encontrado");
  }

  return prisma.matchResult.upsert({
    where: { matchId },
    update: input,
    create: { matchId, ...input },
  });
}
