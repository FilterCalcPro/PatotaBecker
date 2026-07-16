import { api } from "./api";
import { Player } from "@/types";

export interface TvPanelData {
  nextMatch: { date: string; time: string; location: string; format: string; confirmed: number } | null;
  balance: number;
  topScorers: { player: Player | undefined; goals: number }[];
  topAssists: { player: Player | undefined; assists: number }[];
  topOverall: Player[];
}

export async function getTvPanel() {
  const { data } = await api.get<TvPanelData>("/tv/panel");
  return data;
}
