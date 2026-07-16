import { api } from "./api";
import { Match, MatchDetail, MatchFormat } from "@/types";

export interface CreateMatchPayload {
  date: string;
  time: string;
  location: string;
  courtCost: number;
  format: MatchFormat;
}

export async function listMatches() {
  const { data } = await api.get<Match[]>("/matches");
  return data;
}

export async function getMatch(id: string) {
  const { data } = await api.get<MatchDetail>(`/matches/${id}`);
  return data;
}

export async function createMatch(payload: CreateMatchPayload) {
  const { data } = await api.post<Match>("/matches", payload);
  return data;
}

export async function updateMatch(id: string, payload: Partial<CreateMatchPayload>) {
  const { data } = await api.put<Match>(`/matches/${id}`, payload);
  return data;
}

export async function deleteMatch(id: string) {
  await api.delete(`/matches/${id}`);
}

export async function closeMatch(id: string) {
  const { data } = await api.post<Match>(`/matches/${id}/close`);
  return data;
}

export async function startMatch(id: string) {
  const { data } = await api.post<MatchDetail>(`/matches/${id}/start`);
  return data;
}

export async function recalculateMatch(id: string) {
  const { data } = await api.post<MatchDetail>(`/matches/${id}/recalculate`);
  return data;
}

export async function setOwnAttendance(matchId: string, status: "CONFIRMADO" | "RECUSADO") {
  const { data } = await api.post(`/matches/${matchId}/attendance`, { status });
  return data;
}

export async function overrideAttendance(matchId: string, playerId: string, status: string) {
  const { data } = await api.patch(`/matches/${matchId}/attendance/${playerId}`, { status });
  return data;
}

export async function checkinAttendance(matchId: string, playerId: string, attended: boolean) {
  const { data } = await api.post(`/matches/${matchId}/attendance/${playerId}/checkin`, { attended });
  return data;
}

export async function addGuestToMatch(matchId: string, guestId: string, fee?: number) {
  const { data } = await api.post(`/matches/${matchId}/guests`, { guestId, fee });
  return data;
}

export async function setGuestPaid(matchId: string, guestId: string, paid: boolean) {
  const { data } = await api.patch(`/matches/${matchId}/guests/${guestId}/pay`, { paid });
  return data;
}

export async function removeGuestFromMatch(matchId: string, guestId: string) {
  await api.delete(`/matches/${matchId}/guests/${guestId}`);
}
