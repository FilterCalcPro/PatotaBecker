import { api } from "./api";
import { Notification } from "@/types";

export async function listNotifications() {
  const { data } = await api.get<Notification[]>("/notifications");
  return data;
}

export async function markAsRead(id: string) {
  const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
  return data;
}
