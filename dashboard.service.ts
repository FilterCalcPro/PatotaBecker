import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { recalculateAttributes } from "../../utils/overallCalculator";
import { tallyMatchVotes } from "../../utils/voteTally";
import { checkAndUnlockAchievements } from "../achievements/achievements.service";
import { createNotification } from "../notifications/notifications.service";
import { GUEST_DEFAULT_FEE } from "../../utils/constants";
import { CreateMatchInput, UpdateMatchInput } from "./matches.schema";

export async function listMatches(patotaId: string) {
  return prisma.match.findMany({
    where: { patotaId },
    orderBy: { date: "desc" },
    include: {
      _count: { select: { attendances: true } },
      result: true,
    },
  });
}

export async function getMatchById(id: string) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      attendances: { include: { player: true } },
      teams: { include: { players: { include: { player: true, guest: true } } } },
      guests: { include: { guest: true } },
      stats: { include: { player: true, guest: true } },
      votes: true,
      result: true,
    },
  });
  if (!match) {
    throw new ApiError(404, "Jogo não encontrado");
  }
  return match;
}

export async function createMatch(input: CreateMatchInput, patotaId: string) {
  const match = await prisma.match.create({
    data: {
      date: new Date(input.date),
      time: input.time,
      location: input.location,
      courtCost: input.courtCost,
      format: input.format,
      patotaId,
    },
  });

  const activePlayers = await prisma.player.findMany({ where: { status: "ATIVO", patotaId } });
  await prisma.attendance.createMany({
    data: activePlayers.map((player) => ({ matchId: match.id, playerId: player.id })),
  });

  const matchDateLabel = match.date.toLocaleDateString("pt-BR");
  for (const player of activePlayers) {
    await createNotification(
      player.id,
      "ATTENDANCE",
      "Novo jogo marcado",
      `Confirme sua presença no jogo de ${matchDateLabel} às ${match.time} em ${match.location}.`
    );
  }

  return match;
}

export async function updateMatch(id: string, input: UpdateMatchInput) {
  await getMatchById(id);
  return prisma.match.update({
    where: { id },
    data: {
      ...input,
      date: input.date ? new Date(input.date) : undefined,
    },
  });
}

export async function deleteMatch(id: string) {
  await getMatchById(id);
  await prisma.match.delete({ where: { id } });
}

export async function startMatch(id: string) {
  const match = await getMatchById(id);

  const playerIds = match.teams.flatMap((team) => team.players.map((tp) => tp.playerId).filter((v): v is string => !!v));

  if (playerIds.length === 0) {
    throw new ApiError(400, "Monte os times antes de iniciar a partida");
  }

  await prisma.attendance.updateMany({
    where: { matchId: id, playerId: { in: playerIds } },
    data: { attended: true },
  });

  return getMatchById(id);
}

async function applyMatchRecalculation(match: Awaited<ReturnType<typeof getMatchById>>) {
  const votes = await prisma.vote.findMany({ where: { matchId: match.id } });
  const voteResults = tallyMatchVotes(votes);

  for (const attendance of match.attendances) {
    const player = attendance.player;
    const stat = match.stats.find((s) => s.playerId === player.id);
    const mvpEntry = voteResults.mvp.find((m) => m.candidateId === player.id);

    const updated = recalculateAttributes(
      {
        overall: player.overall,
        attack: player.attack,
        passing: player.passing,
        defense: player.defense,
        participation: player.participation,
        presenceAttr: player.presenceAttr,
        physical: player.physical,
      },
      {
        isGoalkeeper: player.type === "GOLEIRO",
        goals: stat?.goals ?? 0,
        assists: stat?.assists ?? 0,
        attended: attendance.attended,
        confirmed: attendance.status === "CONFIRMADO",
        declined: attendance.status === "RECUSADO",
        mvpRank: mvpEntry ? mvpEntry.placement : null,
        wonTopScorer: voteResults.topScorerWinnerId === player.id,
        wonBestGoalkeeper: voteResults.bestGoalkeeperWinnerId === player.id,
      }
    );

    await prisma.player.update({ where: { id: player.id }, data: updated });
    await prisma.overallHistory.create({
      data: { playerId: player.id, matchId: match.id, overall: updated.overall },
    });
    await checkAndUnlockAchievements(player.id);
  }
}

export async function closeMatch(id: string) {
  const match = await getMatchById(id);
  if (match.closed) {
    throw new ApiError(400, "Este jogo já foi fechado");
  }

  await applyMatchRecalculation(match);

  return prisma.match.update({ where: { id }, data: { closed: true } });
}

export async function recalculateMatch(id: string) {
  const match = await getMatchById(id);
  if (!match.closed) {
    throw new ApiError(400, "O jogo precisa estar fechado para recalcular o overall");
  }

  await applyMatchRecalculation(match);

  return getMatchById(id);
}

export async function addGuestToMatch(matchId: string, guestId: string, fee?: number) {
  const [match, guest] = await Promise.all([
    prisma.match.findUnique({ where: { id: matchId } }),
    prisma.guest.findUnique({ where: { id: guestId } }),
  ]);
  if (!match) throw new ApiError(404, "Jogo não encontrado");
  if (!guest) throw new ApiError(404, "Convidado não encontrado");

  return prisma.matchGuest.upsert({
    where: { matchId_guestId: { matchId, guestId } },
    update: { fee: fee ?? guest.defaultFee ?? GUEST_DEFAULT_FEE },
    create: { matchId, guestId, fee: fee ?? guest.defaultFee ?? GUEST_DEFAULT_FEE },
    include: { guest: true },
  });
}

export async function removeGuestFromMatch(matchId: string, guestId: string) {
  await prisma.matchGuest.delete({ where: { matchId_guestId: { matchId, guestId } } }).catch(() => {
    throw new ApiError(404, "Convidado não está registrado neste jogo");
  });
}

export async function setGuestPaid(matchId: string, guestId: string, paid: boolean, patotaId: string) {
  const matchGuest = await prisma.matchGuest.findUnique({
    where: { matchId_guestId: { matchId, guestId } },
    include: { guest: true },
  });
  if (!matchGuest) {
    throw new ApiError(404, "Convidado não está registrado neste jogo");
  }

  const updated = await prisma.matchGuest.update({
    where: { matchId_guestId: { matchId, guestId } },
    data: { paid },
    include: { guest: true },
  });

  if (paid && !matchGuest.paid) {
    await prisma.transaction.create({
      data: {
        type: "ENTRADA",
        category: "CONVIDADO",
        description: `Convidado ${matchGuest.guest.name}`,
        amount: matchGuest.fee,
        patotaId,
      },
    });
  }

  return updated;
}
