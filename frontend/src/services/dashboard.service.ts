import { api } from "./api";
import { Match, MonthlyFee, Player, Transaction } from "@/types";

export interface AdminDashboard {
  nextMatch:
    | (Pick<Match, "id" | "date" | "time" | "location" | "format"> & {
        confirmed: number;
        declined: number;
        pending: number;
      })
    | null;
  finance: { totalIncome: number; totalExpense: number; balance: number };
  topOverall: Player[];
  lastMatches: Match[];
  lastTransactions: Transaction[];
}

export interface PlayerDashboard {
  player: Player;
  nextMatch:
    | (Pick<Match, "id" | "date" | "time" | "location" | "format"> & { myStatus: string })
    | null;
  currentMonthlyFee: MonthlyFee | null;
}

export async function getAdminDashboard() {
  const { data } = await api.get<AdminDashboard>("/dashboard/admin");
  return data;
}

export async function getPlayerDashboard(id: string) {
  const { data } = await api.get<PlayerDashboard>(`/dashboard/player/${id}`);
  return data;
}
