import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { tallyMatchVotes } from "../../utils/voteTally";
import { CastVoteInput } from "./voting.schema";

export async function castVote(matchId: string, voterId: string, input: CastVoteInput) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new ApiError(404, "Jogo não encontrado");
  }

  const voterAttendance = await prisma.attendance.findUnique({
    where: { matchId_playerId: { matchId, playerId: voterId } },
  });
  if (!voterAttendance || !voterAttendance.attended) {
    throw new ApiError(403, "Somente quem participou do jogo pode votar");
  }

  const existingVote = await prisma.vote.findFirst({ where: { matchId, voterId } });
  if (existingVote) {
    throw new ApiError(409, "Você já votou neste jogo");
  }

  const goalkeeper = await prisma.player.findUnique({ where: { id: input.bestGoalkeeper } });
  if (!goalkeeper || goalkeeper.type !== "GOLEIRO") {
    throw new ApiError(400, "O candidato a melhor goleiro precisa ser um goleiro");
  }

  await prisma.$transaction([
    prisma.vote.create({
      data: { matchId, voterId, category: "MVP", candidateId: input.mvpFirst, rank: 1 },
    }),
    prisma.vote.create({
      data: { matchId, voterId, category: "MVP", candidateId: input.mvpSecond, rank: 2 },
    }),
    prisma.vote.create({
      data: { matchId, voterId, category: "MVP", candidateId: input.mvpThird, rank: 3 },
    }),
    prisma.vote.create({
      data: { matchId, voterId, category: "ARTILHEIRO", candidateId: input.topScorer, rank: null },
    }),
    prisma.vote.create({
      data: { matchId, voterId, category: "GOLEIRO", candidateId: input.bestGoalkeeper, rank: null },
    }),
  ]);

  return { success: true };
}

export async function getVoteResults(matchId: string) {
  const votes = await prisma.vote.findMany({ where: { matchId }, include: { candidate: true } });
  const tally = tallyMatchVotes(votes);

  const players = await prisma.player.findMany({
    where: { id: { in: [...tally.mvp.map((m) => m.candidateId), tally.topScorerWinnerId, tally.bestGoalkeeperWinnerId].filter((v): v is string => !!v) } },
  });
  const playerById = new Map(players.map((p) => [p.id, p]));

  return {
    mvp: tally.mvp.map((entry) => ({ ...entry, player: playerById.get(entry.candidateId) ?? null })),
    topScorer: tally.topScorerWinnerId ? playerById.get(tally.topScorerWinnerId) ?? null : null,
    bestGoalkeeper: tally.bestGoalkeeperWinnerId ? playerById.get(tally.bestGoalkeeperWinnerId) ?? null : null,
  };
}

export async function getMyVote(matchId: string, voterId: string) {
  const votes = await prisma.vote.findMany({ where: { matchId, voterId } });
  return { hasVoted: votes.length > 0, votes };
}
