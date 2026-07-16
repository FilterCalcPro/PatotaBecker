export const MONTHLY_FEE_BY_TYPE = {
  LINHA: 60,
  GOLEIRO: 30,
} as const;

export const GUEST_DEFAULT_FEE = 15;

export const INACTIVE_CLEANUP_MONTHS = 3;

export const MAX_OVERALL_DELTA_PER_MATCH = 3;

const APP_TIMEZONE = "America/Sao_Paulo";

// Jogos são salvos com a data em UTC-meia-noite (mesma convenção usada pelo <input type="date">
// no frontend). "Hoje" precisa ser calculado no fuso da patota (Brasil), não no fuso do servidor
// nem em UTC puro — senão um jogo de hoje à noite pode "desaparecer" do próximo jogo horas antes de acontecer.
export function startOfToday(): Date {
  const localDateString = new Date().toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
  return new Date(localDateString);
}
