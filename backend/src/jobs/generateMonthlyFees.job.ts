import { prisma } from "../lib/prisma";
import { MONTHLY_FEE_BY_TYPE } from "../utils/constants";
import { createNotification } from "../modules/notifications/notifications.service";

export async function generateMonthlyFees(referenceDate: Date = new Date()) {
  const referenceMonth = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
  // Meio-dia UTC evita que o fuso do servidor jogue o vencimento pro dia 9 ao converter pra exibição.
  const dueDate = new Date(`${referenceMonth}-10T12:00:00.000Z`);

  // Goleiros não pagam mensalidade.
  const activePlayers = await prisma.player.findMany({ where: { status: "ATIVO", type: "LINHA" } });

  for (const player of activePlayers) {
    const fee = await prisma.monthlyFee.upsert({
      where: { playerId_referenceMonth: { playerId: player.id, referenceMonth } },
      update: {},
      create: {
        playerId: player.id,
        referenceMonth,
        amount: MONTHLY_FEE_BY_TYPE[player.type],
        status: "ABERTO",
        dueDate,
      },
    });

    await createNotification(
      player.id,
      "MONTHLY_FEE",
      "Mensalidade gerada",
      `Sua mensalidade de ${referenceMonth} no valor de R$${fee.amount.toFixed(2)} vence dia 10. Fique de olho pra não atrasar!`
    );
  }

  console.log(`Mensalidades geradas para ${referenceMonth} (${activePlayers.length} jogadores).`);
}
