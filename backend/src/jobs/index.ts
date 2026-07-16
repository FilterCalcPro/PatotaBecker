import cron from "node-cron";
import { generateMonthlyFees } from "./generateMonthlyFees.job";
import { cleanupInactivePlayers } from "./cleanupInactivePlayers.job";

export function startCronJobs() {
  // Todo dia 1 às 00:05, gera as mensalidades do mês para os jogadores ativos.
  cron.schedule("5 0 1 * *", () => {
    generateMonthlyFees().catch((err) => console.error("Erro ao gerar mensalidades:", err));
  });

  // Diariamente às 03:00, remove jogadores inativos há mais de 3 meses.
  cron.schedule("0 3 * * *", () => {
    cleanupInactivePlayers().catch((err) => console.error("Erro ao limpar jogadores inativos:", err));
  });

  console.log("Jobs agendados: geração de mensalidades (dia 1) e limpeza de inativos (diário).");
}
