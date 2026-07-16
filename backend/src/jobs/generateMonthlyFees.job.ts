import { prisma } from "../lib/prisma";
import { MONTHLY_FEE_BY_TYPE } from "../utils/constants";
import { createNotification } from "../modules/notifications/notifications.service";

export async function generateMonthlyFees(referenceDate: Date = new Date()) {
  const referenceMonth = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;

  const activePlayers = await prisma.player.findMany({ where: { status: "ATIVO" } });

  for (const player of activePlayers) {
    const fee = await prisma.monthlyFee.upsert({
      where: { playerId_referenceMonth: { playerId: player.id, referenceMonth } },
      update: {},
      create: {
        playerId: player.id,
        referenceMonth,
        amount: MONTHLY_FEE_BY_TYPE[player.type],
        status: "ABERTO",
      },
    });

    await createNotification(
      player.id,
      "MONTHLY_FEE",
      "Mensalidade gerada",
      `Sua mensalidade de ${referenceMonth} no valor de R$${fee.amount.toFixed(2)} está em aberto.`
    );
  }

  console.log(`Mensalidades geradas para ${referenceMonth} (${activePlayers.length} jogadores).`);
}
