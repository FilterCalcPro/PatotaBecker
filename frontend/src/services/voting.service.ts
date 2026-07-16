import { api } from "./api";
import { Player } from "@/types";

export interface CastVotePayload {
  mvpFirst: string;
  mvpSecond: string;
  mvpThird: string;
  topScorer: string;
  bestGoalkeeper: string;
}

export interface VoteResults {
  mvp: { candidateId: string; points: number; placement: number; player: Player | null }[];
  topScorer: Player | null;
  bestGoalkeeper: Player | null;
}

export async function castVote(matchId: string, payload: CastVotePayload) {
  const { data } = await api.post(`/matches/${matchId}/votes`, payload);
  return data;
}

export async function getVoteResults(matchId: string) {
  const { data } = await api.get<VoteResults>(`/matches/${matchId}/votes/results`);
  return data;
}

export async function getMyVote(matchId: string) {
  const { data } = await api.get<{ hasVoted: boolean }>(`/matches/${matchId}/votes/me`);
  return data;
}
