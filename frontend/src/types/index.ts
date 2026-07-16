export type Role = "ADMIN" | "JOGADOR";
export type PlayerType = "LINHA" | "GOLEIRO";
export type PlayerStatus = "ATIVO" | "INATIVO";
export type MatchFormat = "SEIS" | "SETE";
export type AttendanceStatus = "PENDENTE" | "CONFIRMADO" | "RECUSADO";
export type PaymentStatus = "ABERTO" | "PAGO";
export type PaymentMethod = "PIX" | "CARTAO";
export type TransactionType = "ENTRADA" | "SAIDA";
export type VoteCategory = "MVP" | "ARTILHEIRO" | "GOLEIRO";

export interface Player {
  id: string;
  name: string;
  nickname: string;
  whatsapp: string;
  photoUrl: string | null;
  type: PlayerType;
  status: PlayerStatus;
  joinedAt: string;
  inactiveSince: string | null;
  overall: number;
  attack: number;
  passing: number;
  defense: number;
  participation: number;
  presenceAttr: number;
  physical: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string } | null;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  player: Player | null;
}

export interface Guest {
  id: string;
  name: string;
  whatsapp: string | null;
  defaultFee: number | null;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  whatsapp: string;
  city: string;
  position: number;
  approved: boolean;
  createdAt: string;
}

export interface Attendance {
  id: string;
  matchId: string;
  playerId: string;
  status: AttendanceStatus;
  attended: boolean;
  respondedAt: string | null;
  player: Player;
}

export interface Match {
  id: string;
  date: string;
  time: string;
  location: string;
  courtCost: number;
  format: MatchFormat;
  closed: boolean;
  createdAt: string;
  _count?: { attendances: number };
  result?: MatchResult | null;
}

export interface MatchDetail extends Match {
  attendances: Attendance[];
  teams: Team[];
  guests: { id: string; guestId: string; fee: number; paid: boolean; guest: Guest }[];
  stats: PlayerMatchStat[];
  votes: unknown[];
}

export interface Team {
  id: string;
  matchId: string;
  name: string;
  color: string;
  players: { id: string; playerId: string | null; player: Player | null; guestId: string | null; guest: Guest | null }[];
}

export interface PlayerMatchStat {
  id: string;
  matchId: string;
  playerId: string | null;
  player: Player | null;
  guestId: string | null;
  guest: Guest | null;
  goals: number;
  assists: number;
}

export interface MatchResult {
  id: string;
  matchId: string;
  teamAName: string;
  teamAGoals: number;
  teamBName: string;
  teamBGoals: number;
}

export interface MonthlyFee {
  id: string;
  playerId: string;
  referenceMonth: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod | null;
  paidAt: string | null;
  player?: Player;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface PlayerAchievement {
  id: string;
  playerId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

export interface OverallHistoryEntry {
  id: string;
  playerId: string;
  matchId: string | null;
  overall: number;
  createdAt: string;
}

export interface PlayerStats {
  player: Player;
  goals: number;
  assists: number;
  presences: number;
  confirmations: number;
  mvpWins: number;
  topScorerWins: number;
  bestGkWins: number;
  currentStreak: number;
  attendanceRate: number;
  monthlyFees: MonthlyFee[];
}

export interface RankingEntry {
  player: Player;
  value: number;
}

export interface Notification {
  id: string;
  playerId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
