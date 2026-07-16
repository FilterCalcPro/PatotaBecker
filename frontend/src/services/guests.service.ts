import { api } from "./api";
import { Guest } from "@/types";

export async function listGuests() {
  const { data } = await api.get<Guest[]>("/guests");
  return data;
}

export async function createGuest(payload: { name: string; whatsapp?: string; defaultFee?: number }) {
  const { data } = await api.post<Guest>("/guests", payload);
  return data;
}

export async function updateGuest(id: string, payload: Partial<{ name: string; whatsapp: string; defaultFee: number }>) {
  const { data } = await api.put<Guest>(`/guests/${id}`, payload);
  return data;
}

export async function deleteGuest(id: string) {
  await api.delete(`/guests/${id}`);
}
