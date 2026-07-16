import { api } from "./api";
import { Team } from "@/types";

export async function getTeams(matchId: string) {
  const { data } = await api.get<Team[]>(`/matches/${matchId}/teams`);
  return data;
}

export async function saveTeams(
  matchId: string,
  teams: { name: string; color: string; playerIds: string[]; guestIds: string[] }[]
) {
  const { data } = await api.put<Team[]>(`/matches/${matchId}/teams`, { teams });
  return data;
}

export async function autoBalanceTeams(matchId: string) {
  const { data } = await api.post<Team[]>(`/matches/${matchId}/teams/balance`);
  return data;
}

export async function clearTeams(matchId: string) {
  await api.delete(`/matches/${matchId}/teams`);
}
