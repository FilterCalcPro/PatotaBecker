import { api } from "./api";
import { Player, PlayerAchievement, PlayerStats, OverallHistoryEntry, PlayerStatus, PlayerType } from "@/types";

export async function listPlayers(status?: PlayerStatus) {
  const { data } = await api.get<Player[]>("/players", { params: status ? { status } : undefined });
  return data;
}

export async function getPlayer(id: string) {
  const { data } = await api.get<Player>(`/players/${id}`);
  return data;
}

export async function getPlayerStats(id: string) {
  const { data } = await api.get<PlayerStats>(`/players/${id}/stats`);
  return data;
}

export async function getPlayerOverallHistory(id: string) {
  const { data } = await api.get<OverallHistoryEntry[]>(`/players/${id}/overall-history`);
  return data;
}

export async function getPlayerAchievements(id: string) {
  const { data } = await api.get<PlayerAchievement[]>(`/players/${id}/achievements`);
  return data;
}

export interface CreatePlayerPayload {
  name: string;
  nickname: string;
  whatsapp: string;
  photoUrl?: string | null;
  type: PlayerType;
  createLogin?: boolean;
  email?: string;
  password?: string;
}

export async function createPlayer(payload: CreatePlayerPayload) {
  const { data } = await api.post<Player>("/players", payload);
  return data;
}

export async function updatePlayer(id: string, payload: Partial<CreatePlayerPayload>) {
  const { data } = await api.put<Player>(`/players/${id}`, payload);
  return data;
}

export async function createLoginForPlayer(id: string, email: string, password: string) {
  const { data } = await api.post<Player>(`/players/${id}/login`, { email, password });
  return data;
}

export async function resetPasswordForPlayer(id: string, password: string) {
  const { data } = await api.patch<Player>(`/players/${id}/password`, { password });
  return data;
}

export async function updatePlayerStatus(id: string, status: PlayerStatus) {
  const { data } = await api.patch<Player>(`/players/${id}/status`, { status });
  return data;
}

export async function deletePlayer(id: string) {
  await api.delete(`/players/${id}`);
}
