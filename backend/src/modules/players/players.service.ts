import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../utils/password";
import { createNotification } from "../notifications/notifications.service";
import { CreatePlayerInput, UpdatePlayerInput } from "./players.schema";

// Presenças só são geradas em massa quando um jogo é criado. Um jogador que entra depois
// (recém-cadastrado ou reativado) precisa ser incluído retroativamente nos jogos ainda abertos,
// senão ele nunca aparece na lista de confirmação de presença.
export async function ensureAttendanceForOpenMatches(playerId: string) {
  const openMatches = await prisma.match.findMany({ where: { closed: false } });
  if (openMatches.length === 0) return;

  // SQLite não suporta skipDuplicates no createMany, então filtramos manualmente
  // os jogos que esse jogador ainda não possui registro de presença.
  const existing = await prisma.attendance.findMany({
    where: { playerId, matchId: { in: openMatches.map((m) => m.id) } },
    select: { matchId: true },
  });
  const existingMatchIds = new Set(existing.map((a) => a.matchId));
  const missingMatches = openMatches.filter((m) => !existingMatchIds.has(m.id));
  if (missingMatches.length === 0) return;

  await prisma.attendance.createMany({
    data: missingMatches.map((match) => ({ matchId: match.id, playerId })),
  });

  for (const match of missingMatches) {
    const matchDateLabel = match.date.toLocaleDateString("pt-BR");
    await createNotification(
      playerId,
      "ATTENDANCE",
      "Confirme sua presença",
      `Você foi incluído no jogo de ${matchDateLabel} às ${match.time} em ${match.location}. Confirme sua presença!`
    );
  }
}

export async function listPlayers(status?: "ATIVO" | "INATIVO") {
  return prisma.player.findMany({
    where: status ? { status } : undefined,
    orderBy: { overall: "desc" },
  });
}

export async function getPlayerById(id: string) {
  const player = await prisma.player.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!player) {
    throw new ApiError(404, "Jogador não encontrado");
  }
  return player;
}

export async function createPlayer(input: CreatePlayerInput) {
  const player = await prisma.player.create({
    data: {
      name: input.name,
      nickname: input.nickname,
      whatsapp: input.whatsapp,
      photoUrl: input.photoUrl ?? null,
      type: input.type,
    },
  });

  if (input.createLogin && input.email && input.password) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError(409, "Já existe um usuário com este e-mail");
    }
    const passwordHash = await hashPassword(input.password);
    await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: "JOGADOR",
        playerId: player.id,
      },
    });
  }

  await ensureAttendanceForOpenMatches(player.id);

  return player;
}

export async function createLoginForPlayer(id: string, email: string, password: string) {
  const player = await getPlayerById(id);
  if (player.user) {
    throw new ApiError(409, "Este jogador já possui um acesso de login");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "Já existe um usuário com este e-mail");
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { email, passwordHash, role: "JOGADOR", playerId: id },
  });

  return getPlayerById(id);
}

export async function resetPasswordForPlayer(id: string, password: string) {
  const player = await getPlayerById(id);
  if (!player.user) {
    throw new ApiError(404, "Este jogador ainda não possui acesso de login");
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: player.user.id },
    data: { passwordHash },
  });

  return getPlayerById(id);
}

export async function updatePlayer(id: string, input: UpdatePlayerInput) {
  await getPlayerById(id);
  return prisma.player.update({ where: { id }, data: input });
}

export async function updatePlayerStatus(id: string, status: "ATIVO" | "INATIVO") {
  const player = await getPlayerById(id);
  const updated = await prisma.player.update({
    where: { id },
    data: {
      status,
      inactiveSince: status === "INATIVO" ? new Date() : null,
    },
  });

  if (status === "ATIVO" && player.status === "INATIVO") {
    await ensureAttendanceForOpenMatches(id);
  }

  return updated;
}

export async function deletePlayer(id: string) {
  await getPlayerById(id);
  await prisma.player.delete({ where: { id } });
}

export async function getPlayerStats(id: string) {
  const player = await getPlayerById(id);

  const [statsAgg, presenceCount, confirmedCount, mvpWins, topScorerWins, bestGkWins, monthlyFees] = await Promise.all([
    prisma.playerMatchStat.aggregate({
      where: { playerId: id },
      _sum: { goals: true, assists: true },
    }),
    prisma.attendance.count({ where: { playerId: id, attended: true } }),
    prisma.attendance.count({ where: { playerId: id, status: "CONFIRMADO" } }),
    prisma.vote.count({ where: { candidateId: id, category: "MVP", rank: 1 } }),
    prisma.vote.count({ where: { candidateId: id, category: "ARTILHEIRO" } }),
    prisma.vote.count({ where: { candidateId: id, category: "GOLEIRO" } }),
    prisma.monthlyFee.findMany({ where: { playerId: id }, orderBy: { referenceMonth: "desc" } }),
  ]);

  const attendances = await prisma.attendance.findMany({
    where: { playerId: id },
    orderBy: { match: { date: "desc" } },
    include: { match: true },
  });

  let currentStreak = 0;
  for (const attendance of attendances) {
    if (attendance.attended) {
      currentStreak += 1;
    } else if (attendance.match.date <= new Date()) {
      break;
    }
  }

  const totalConfirmedOrPast = attendances.filter((a) => a.match.date <= new Date()).length;
  const attendanceRate = totalConfirmedOrPast > 0 ? Math.round((presenceCount / totalConfirmedOrPast) * 100) : 0;

  return {
    player,
    goals: statsAgg._sum.goals ?? 0,
    assists: statsAgg._sum.assists ?? 0,
    presences: presenceCount,
    confirmations: confirmedCount,
    mvpWins,
    topScorerWins,
    bestGkWins,
    currentStreak,
    attendanceRate,
    monthlyFees,
  };
}

export async function getPlayerOverallHistory(id: string) {
  await getPlayerById(id);
  return prisma.overallHistory.findMany({
    where: { playerId: id },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPlayerAchievements(id: string) {
  await getPlayerById(id);
  return prisma.playerAchievement.findMany({
    where: { playerId: id },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });
}
