import { api } from "./api";
import { RankingEntry } from "@/types";

export type RankingType = "goals" | "assists" | "mvp" | "top-scorer" | "best-gk" | "presences" | "streak" | "overall";

export async function getRanking(type: RankingType) {
  const { data } = await api.get<RankingEntry[]>(`/rankings/${type}`);
  return data;
}
