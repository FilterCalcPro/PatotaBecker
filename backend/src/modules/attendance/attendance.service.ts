import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { createNotification } from "../notifications/notifications.service";

async function getAttendanceOrThrow(matchId: string, playerId: string) {
  const attendance = await prisma.attendance.findUnique({
    where: { matchId_playerId: { matchId, playerId } },
  });
  if (!attendance) {
    throw new ApiError(404, "Registro de presença não encontrado para este jogador neste jogo");
  }
  return attendance;
}

export async function setOwnAttendance(matchId: string, playerId: string, status: "CONFIRMADO" | "RECUSADO") {
  await getAttendanceOrThrow(matchId, playerId);
  return prisma.attendance.update({
    where: { matchId_playerId: { matchId, playerId } },
    data: { status, respondedAt: new Date() },
  });
}

export async function overrideAttendance(matchId: string, playerId: string, status: "CONFIRMADO" | "RECUSADO" | "PENDENTE") {
  await getAttendanceOrThrow(matchId, playerId);
  return prisma.attendance.update({
    where: { matchId_playerId: { matchId, playerId } },
    data: { status, respondedAt: new Date() },
  });
}

export async function checkinAttendance(matchId: string, playerId: string, attended: boolean) {
  await getAttendanceOrThrow(matchId, playerId);
  const updated = await prisma.attendance.update({
    where: { matchId_playerId: { matchId, playerId } },
    data: { attended },
  });

  if (attended) {
    await createNotification(
      playerId,
      "VOTING",
      "Votação liberada",
      "Sua presença foi confirmada. Vote em MVP, melhor marcador e melhor goleiro do jogo!"
    );
  }

  return updated;
}
