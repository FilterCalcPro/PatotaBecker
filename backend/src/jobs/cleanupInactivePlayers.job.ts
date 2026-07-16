import { prisma } from "../lib/prisma";
import { INACTIVE_CLEANUP_MONTHS } from "../utils/constants";

export async function cleanupInactivePlayers(now: Date = new Date()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - INACTIVE_CLEANUP_MONTHS);

  const playersToDelete = await prisma.player.findMany({
    where: { status: "INATIVO", inactiveSince: { lte: cutoff } },
  });

  for (const player of playersToDelete) {
    await prisma.player.delete({ where: { id: player.id } });
  }

  if (playersToDelete.length > 0) {
    console.log(`${playersToDelete.length} jogador(es) inativo(s) há mais de ${INACTIVE_CLEANUP_MONTHS} meses excluído(s).`);
  }
}
