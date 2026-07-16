import { MAX_OVERALL_DELTA_PER_MATCH } from "./constants";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export interface MatchPerformanceInput {
  isGoalkeeper: boolean;
  goals: number;
  assists: number;
  attended: boolean;
  confirmed: boolean;
  declined: boolean;
  mvpRank: 1 | 2 | 3 | null;
  wonTopScorer: boolean;
  wonBestGoalkeeper: boolean;
}

export interface PlayerAttributes {
  overall: number;
  attack: number;
  passing: number;
  defense: number;
  participation: number;
  presenceAttr: number;
  physical: number;
}

function voteBonus(perf: MatchPerformanceInput) {
  let bonus = 0;
  if (perf.mvpRank === 1) bonus += 15;
  else if (perf.mvpRank === 2) bonus += 10;
  else if (perf.mvpRank === 3) bonus += 5;
  if (perf.wonTopScorer) bonus += 10;
  if (perf.wonBestGoalkeeper) bonus += 10;
  return bonus;
}

function computeMatchScore(perf: MatchPerformanceInput): number {
  const attackComponent = perf.isGoalkeeper ? 0 : Math.min(perf.goals * 15, 40);
  const passComponent = Math.min(perf.assists * 10, 30);
  const presenceComponent = perf.attended ? 20 : 0;
  const participationComponent = perf.confirmed ? 10 : perf.declined ? -10 : 0;
  const goalkeeperComponent = perf.isGoalkeeper && perf.wonBestGoalkeeper ? 30 : 0;

  return clamp(
    attackComponent + passComponent + presenceComponent + participationComponent + goalkeeperComponent + voteBonus(perf),
    0,
    100
  );
}

// Suaviza a variação para o overall nunca saltar mais de MAX_OVERALL_DELTA_PER_MATCH pontos em uma única partida.
function smoothedDelta(current: number, target: number): number {
  const rawDelta = (target - current) * 0.2;
  return clamp(Math.round(rawDelta), -MAX_OVERALL_DELTA_PER_MATCH, MAX_OVERALL_DELTA_PER_MATCH);
}

export function recalculateAttributes(current: PlayerAttributes, perf: MatchPerformanceInput): PlayerAttributes {
  const matchScore = computeMatchScore(perf);

  const overall = clamp(current.overall + smoothedDelta(current.overall, matchScore), 0, 100);

  const attackTarget = perf.isGoalkeeper ? current.attack : clamp(perf.goals * 20 + (perf.attended ? 20 : 0), 0, 100);
  const passingTarget = clamp(perf.assists * 20 + (perf.attended ? 20 : 0), 0, 100);
  const defenseTarget = perf.isGoalkeeper
    ? clamp((perf.wonBestGoalkeeper ? 40 : 0) + (perf.attended ? 40 : 0), 0, 100)
    : current.defense;
  const participationTarget = perf.confirmed ? clamp(current.participation + 5, 0, 100) : perf.declined ? clamp(current.participation - 5, 0, 100) : current.participation;
  const presenceTarget = perf.attended ? clamp(current.presenceAttr + 4, 0, 100) : clamp(current.presenceAttr - 4, 0, 100);
  const physicalTarget = perf.attended ? clamp(current.physical + 3, 0, 100) : current.physical;

  return {
    overall,
    attack: clamp(current.attack + smoothedDelta(current.attack, attackTarget), 0, 100),
    passing: clamp(current.passing + smoothedDelta(current.passing, passingTarget), 0, 100),
    defense: clamp(current.defense + smoothedDelta(current.defense, defenseTarget), 0, 100),
    participation: clamp(current.participation + smoothedDelta(current.participation, participationTarget), 0, 100),
    presenceAttr: clamp(current.presenceAttr + smoothedDelta(current.presenceAttr, presenceTarget), 0, 100),
    physical: clamp(current.physical + smoothedDelta(current.physical, physicalTarget), 0, 100),
  };
}
