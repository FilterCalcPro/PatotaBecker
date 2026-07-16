import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, TrendingDown, TrendingUp, Wallet, Trophy, Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { OverallBadge } from "@/components/shared/OverallBadge";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import * as dashboardService from "@/services/dashboard.service";
import * as matchesService from "@/services/matches.service";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  if (isAdmin) return <AdminDashboard />;
  return <PlayerDashboard playerId={user!.player!.id} />;
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard", "admin"], queryFn: dashboardService.getAdminDashboard });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Confirmados" value={data.nextMatch?.confirmed ?? 0} icon={CheckCircle2} tone="success" />
        <StatCard label="Não responderam" value={data.nextMatch?.pending ?? 0} icon={Clock} />
        <StatCard label="Não vão" value={data.nextMatch?.declined ?? 0} icon={XCircle} tone="destructive" />
        <StatCard label="Saldo do caixa" value={formatCurrency(data.finance.balance)} icon={Wallet} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Próximo jogo
            </CardTitle>
            {data.nextMatch && (
              <Button size="sm" variant="outline" asChild>
                <Link to={`/jogos/${data.nextMatch.id}`}>Ver detalhes</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {data.nextMatch ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-lg font-bold capitalize">{formatDateLong(data.nextMatch.date)}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.nextMatch.time} · {data.nextMatch.location} · {data.nextMatch.format === "SEIS" ? "6x6" : "7x7"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="success">{data.nextMatch.confirmed} confirmados</Badge>
                  <Badge variant="outline">{data.nextMatch.pending} pendentes</Badge>
                  <Badge variant="destructive">{data.nextMatch.declined} não vão</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum jogo agendado. Crie o próximo jogo de quinta.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Top Overall
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.topOverall.map((player) => (
              <Link
                key={player.id}
                to={`/jogadores/${player.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <PlayerAvatar name={player.name} photoUrl={player.photoUrl} className="h-8 w-8" />
                  <span className="text-sm font-medium">{player.nickname}</span>
                </div>
                <OverallBadge overall={player.overall} size="sm" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos jogos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.lastMatches.length === 0 && <p className="text-sm text-muted-foreground">Nenhum jogo registrado ainda.</p>}
            {data.lastMatches.map((match) => (
              <Link
                key={match.id}
                to={`/jogos/${match.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-secondary"
              >
                <span>{formatDateLong(match.date)}</span>
                {match.result ? (
                  <span className="font-semibold">
                    {match.result.teamAGoals} x {match.result.teamBGoals}
                  </span>
                ) : (
                  <Badge variant="outline">{match.closed ? "Fechado" : "Em aberto"}</Badge>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas movimentações</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.lastTransactions.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>}
            {data.lastTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm">
                <div className="flex items-center gap-2">
                  {tx.type === "ENTRADA" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span>{tx.description}</span>
                </div>
                <span className={tx.type === "ENTRADA" ? "font-semibold text-success" : "font-semibold text-destructive"}>
                  {tx.type === "ENTRADA" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PlayerDashboard({ playerId }: { playerId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "player", playerId],
    queryFn: () => dashboardService.getPlayerDashboard(playerId),
  });

  async function respond(status: "CONFIRMADO" | "RECUSADO") {
    if (!data?.nextMatch) return;
    try {
      await matchesService.setOwnAttendance(data.nextMatch.id, status);
      toast.success(status === "CONFIRMADO" ? "Presença confirmada!" : "Você marcou que não vai.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "player", playerId] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="stat-glow">
          <CardContent className="flex items-center gap-4 p-5">
            <OverallBadge overall={data.player.overall} size="lg" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Seu Overall</p>
              <p className="text-sm text-muted-foreground">{data.player.type === "GOLEIRO" ? "Goleiro" : "Jogador de linha"}</p>
            </div>
          </CardContent>
        </Card>
        <StatCard
          label="Mensalidade do mês"
          value={data.currentMonthlyFee ? formatCurrency(data.currentMonthlyFee.amount) : "—"}
          icon={Wallet}
          tone={data.currentMonthlyFee?.status === "PAGO" ? "success" : "destructive"}
          hint={data.currentMonthlyFee?.status === "PAGO" ? "Pago" : "Em aberto"}
        />
        <StatCard label="Status" value={data.player.status === "ATIVO" ? "Ativo" : "Inativo"} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" /> Próximo jogo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.nextMatch ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-lg font-bold capitalize">{formatDateLong(data.nextMatch.date)}</p>
                <p className="text-sm text-muted-foreground">
                  {data.nextMatch.time} · {data.nextMatch.location} · {data.nextMatch.format === "SEIS" ? "6x6" : "7x7"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Sua resposta:</span>
                <Badge variant={data.nextMatch.myStatus === "CONFIRMADO" ? "success" : data.nextMatch.myStatus === "RECUSADO" ? "destructive" : "outline"}>
                  {data.nextMatch.myStatus === "CONFIRMADO" ? "Vou" : data.nextMatch.myStatus === "RECUSADO" ? "Não vou" : "Pendente"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => respond("CONFIRMADO")} variant={data.nextMatch.myStatus === "CONFIRMADO" ? "default" : "outline"}>
                  Vou
                </Button>
                <Button onClick={() => respond("RECUSADO")} variant={data.nextMatch.myStatus === "RECUSADO" ? "destructive" : "outline"}>
                  Não vou
                </Button>
                <Button variant="ghost" asChild>
                  <Link to={`/jogos/${data.nextMatch.id}`}>Ver jogo</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum jogo agendado no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
