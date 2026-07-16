import { api } from "./api";
import { Achievement } from "@/types";

export async function listAchievements() {
  const { data } = await api.get<Achievement[]>("/achievements");
  return data;
}
