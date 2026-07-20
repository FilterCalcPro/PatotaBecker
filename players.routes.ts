import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { balanceTeams } from "../../utils/teamBalancer";
import { SaveTeamsInput } from "./teams.schema";

export async function getTeams(matchId: string) {
  return prisma.team.findMany({
    where: { matchId },
    include: { players: { include: { player: true, guest: true } } },
  });
}

export async function saveTeams(matchId: string, input: SaveTeamsInput) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new ApiError(404, "Jogo não encontrado");
  }

  await prisma.team.deleteMany({ where: { matchId } });

  const created = await Promise.all(
    input.teams.map((team) =>
      prisma.team.create({
        data: {
          matchId,
          name: team.name,
          color: team.color,
          players: {
            create: [
              ...team.playerIds.map((playerId) => ({ playerId })),
              ...team.guestIds.map((guestId) => ({ guestId })),
            ],
          },
        },
        include: { players: { include: { player: true, guest: true } } },
      })
    )
  );

  return created;
}

export async function clearTeams(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new ApiError(404, "Jogo não encontrado");
  }

  await prisma.team.deleteMany({ where: { matchId } });
}

export async function autoBalanceTeams(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new ApiError(404, "Jogo não encontrado");
  }

  const [confirmedAttendances, matchGuests] = await Promise.all([
    prisma.attendance.findMany({
      where: { matchId, status: "CONFIRMADO" },
      include: { player: true },
    }),
    prisma.matchGuest.findMany({ where: { matchId }, include: { guest: true } }),
  ]);

  const totalCount = confirmedAttendances.length + matchGuests.length;
  if (totalCount < 2) {
    throw new ApiError(400, "É necessário ao menos 2 jogadores ou convidados confirmados para montar os times");
  }

  const players = confirmedAttendances.map((a) => ({
    id: a.player.id,
    type: a.player.type,
    overall: a.player.overall,
  }));

  // Convidados não têm overall próprio: entram como jogador de linha com overall
  // igual à média dos confirmados, para não distorcer o equilíbrio dos times.
  const averageOverall =
    players.length > 0 ? Math.round(players.reduce((sum, p) => sum + p.overall, 0) / players.length) : 50;
  const guestEntries = matchGuests.map((mg) => ({
    id: mg.guest.id,
    type: "LINHA" as const,
    overall: averageOverall,
  }));

  const guestIdSet = new Set(guestEntries.map((g) => g.id));
  const { teamA, teamB } = balanceTeams([...players, ...guestEntries]);

  const splitByKind = (ids: string[]) => ({
    playerIds: ids.filter((id) => !guestIdSet.has(id)),
    guestIds: ids.filter((id) => guestIdSet.has(id)),
  });

  const teamASplit = splitByKind(teamA);
  const teamBSplit = splitByKind(teamB);

  return saveTeams(matchId, {
    teams: [
      { name: "Time A", color: "#22c55e", ...teamASplit },
      { name: "Time B", color: "#3b82f6", ...teamBSplit },
    ],
  });
}
