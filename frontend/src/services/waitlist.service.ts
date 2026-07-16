import { api } from "./api";
import { WaitlistEntry, PlayerType } from "@/types";

export async function listWaitlist() {
  const { data } = await api.get<WaitlistEntry[]>("/waitlist");
  return data;
}

export async function createWaitlistEntry(payload: { name: string; whatsapp: string; city: string }) {
  const { data } = await api.post<WaitlistEntry>("/waitlist", payload);
  return data;
}

export async function approveWaitlistEntry(id: string, type: PlayerType) {
  const { data } = await api.patch(`/waitlist/${id}/approve`, { type });
  return data;
}

export async function deleteWaitlistEntry(id: string) {
  await api.delete(`/waitlist/${id}`);
}
