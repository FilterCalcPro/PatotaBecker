import { LayoutDashboard, Users, UserPlus, ListOrdered, CalendarDays, Wallet, Trophy, Tv } from "lucide-react";

export const adminLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/jogadores", label: "Jogadores", icon: Users },
  { to: "/convidados", label: "Convidados", icon: UserPlus },
  { to: "/fila-espera", label: "Fila de Espera", icon: ListOrdered },
  { to: "/jogos", label: "Jogos", icon: CalendarDays },
  { to: "/caixa", label: "Caixa", icon: Wallet },
  { to: "/rankings", label: "Rankings", icon: Trophy },
  { to: "/tv", label: "Painel TV", icon: Tv },
];

export const playerLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/jogos", label: "Jogos", icon: CalendarDays },
  { to: "/jogadores", label: "Jogadores", icon: Users },
  { to: "/rankings", label: "Rankings", icon: Trophy },
];
