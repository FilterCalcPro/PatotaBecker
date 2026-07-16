import { api } from "./api";
import { PlayerMatchStat } from "@/types";

export async function setMatchStats(matchId: string, stats: { playerId: string; goals: number; assists: number }[]) {
  const { data } = await api.post(`/matches/${matchId}/stats`, { stats });
  return data;
}

export async function incrementStat(
  matchId: string,
  payload: { playerId?: string; guestId?: string; field: "goals" | "assists"; delta: 1 | -1 }
) {
  const { data } = await api.post<PlayerMatchStat>(`/matches/${matchId}/stats/increment`, payload);
  return data;
}

export async function setMatchResult(
  matchId: string,
  payload: { teamAName: string; teamAGoals: number; teamBName: string; teamBGoals: number }
) {
  const { data } = await api.post(`/matches/${matchId}/result`, payload);
  return data;
}
