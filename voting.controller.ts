import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { ensureAttendanceForOpenMatches } from "../players/players.service";
import { CreateWaitlistInput } from "./waitlist.schema";

export async function listWaitlist(patotaId: string) {
  return prisma.waitlistEntry.findMany({
    where: { approved: false, patotaId },
    orderBy: { position: "asc" },
  });
}

export async function createWaitlistEntry(input: CreateWaitlistInput, patotaId: string) {
  const lastPosition = await prisma.waitlistEntry.aggregate({
    where: { approved: false, patotaId },
    _max: { position: true },
  });

  return prisma.waitlistEntry.create({
    data: {
      name: input.name,
      whatsapp: input.whatsapp,
      city: input.city,
      position: (lastPosition._max.position ?? 0) + 1,
      patotaId,
    },
  });
}

export async function approveWaitlistEntry(id: string, type: "LINHA" | "GOLEIRO", patotaId: string) {
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) {
    throw new ApiError(404, "Registro da fila não encontrado");
  }
  if (entry.approved) {
    throw new ApiError(400, "Este registro já foi aprovado");
  }

  const [, player] = await prisma.$transaction([
    prisma.waitlistEntry.update({ where: { id }, data: { approved: true } }),
    prisma.player.create({
      data: {
        name: entry.name,
        nickname: entry.name.split(" ")[0],
        whatsapp: entry.whatsapp,
        type,
        patotaId,
      },
    }),
  ]);

  await ensureAttendanceForOpenMatches(player.id, patotaId);

  return player;
}

export async function deleteWaitlistEntry(id: string) {
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) {
    throw new ApiError(404, "Registro da fila não encontrado");
  }
  await prisma.waitlistEntry.delete({ where: { id } });
}
