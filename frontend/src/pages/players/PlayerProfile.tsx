import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Award,
  Calendar,
  Flame,
  Goal,
  HandHeart,
  KeyRound,
  Pencil,
  Shield,
  Trash2,
  Trophy,
  UserCheck,
  UserX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { OverallBadge } from "@/components/shared/OverallBadge";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { OverallChart } from "@/components/players/OverallChart";
import { PlayerEditDialog } from "@/components/players/PlayerEditDialog";
import { CreateLoginDialog } from "@/components/players/CreateLoginDialog";
import { ResetPasswordDialog } from "@/components/players/ResetPasswordDialog";
import { useAuth } from "@/hooks/useAuth";
import * as playersService from "@/services/players.service";
import { getErrorMessage } from "@/services/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const { data: player, isLoading } = useQuery({
    queryKey: ["player", id],
    queryFn: () => playersService.getPlayer(id!),
    enabled: !!id,
  });
  const { data: stats } = useQuery({
    queryKey: ["player-stats", id],
    queryFn: () => playersService.getPlayerStats(id!),
    enabled: !!id,
  });
  const { data: history } = useQuery({
    queryKey: ["player-overall-history", id],
    queryFn: () => playersService.getPlayerOverallHistory(id!),
    enabled: !!id,
  });
  const { data: achievements } = useQuery({
    queryKey: ["player-achievements", id],
    queryFn: () => playersService.getPlayerAchievements(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: () => playersService.updatePlayerStatus(id!, player!.status === "ATIVO" ? "INATIVO" : "ATIVO"),
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["player", id] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => playersService.deletePlayer(id!),
    onSuccess: () => {
      toast.success("Jogador removido.");
      navigate("/jogadores");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (isLoading || !player) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const canEdit = isAdmin || user?.player?.id === player.id;

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-overall" />
        <CardContent className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <PlayerAvatar name={player.name} photoUrl={player.photoUrl} className="h-24 w-24 border-4 border-card" />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{player.nickname}</h2>
              <p className="text-sm text-muted-foreground">{player.name}</p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="outline">{player.type === "GOLEIRO" ? "Goleiro" : "Jogador de Linha"}</Badge>
                <Badge variant={player.status === "ATIVO" ? "success" : "destructive"}>{player.status}</Badge>
                {player.user ? (
                  <>
                    <Badge variant="secondary" className="gap-1">
                      <KeyRound className="h-3 w-3" /> {player.user.email}
                    </Badge>
                    {isAdmin && (
                      <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={() => setResetPasswordOpen(true)}>
                        <KeyRound className="h-3 w-3" /> Redefinir senha
                      </Button>
                    )}
                  </>
                ) : (
                  isAdmin && (
                    <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={() => setLoginOpen(true)}>
                      <KeyRound className="h-3 w-3" /> Criar acesso de login
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OverallBadge overall={player.overall} size="lg" />
            {canEdit && (
              <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {isAdmin && (
              <>
                <Button variant="outline" size="icon" onClick={() => statusMutation.mutate()} title="Alternar status">
                  {player.status === "ATIVO" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm(`Remover ${player.nickname} definitivamente?`)) deleteMutation.mutate();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Gols" value={stats?.goals ?? 0} icon={Goal} />
        <StatCard label="Assistências" value={stats?.assists ?? 0} icon={HandHeart} />
        <StatCard label="Presenças" value={stats?.presences ?? 0} icon={Calendar} />
        <StatCard label="Sequência" value={stats?.currentStreak ?? 0} icon={Flame} />
        <StatCard label="Aproveitamento" value={`${stats?.attendanceRate ?? 0}%`} icon={UserCheck} />
        <StatCard label="MVP" value={stats?.mvpWins ?? 0} icon={Trophy} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução do Overall</CardTitle>
          </CardHeader>
          <CardContent>
            <OverallChart history={history ?? []} />
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[
                ["Ataque", player.attack],
                ["Passe", player.passing],
                ["Defesa", player.defense],
                ["Participação", player.participation],
                ["Presença", player.presenceAttr],
                ["Físico", player.physical],
              ].map(([label, value]) => (
                <div key={label as string} className="text-center">
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {(!achievements || achievements.length === 0) && (
              <p className="text-sm text-muted-foreground">Nenhuma conquista desbloqueada ainda.</p>
            )}
            {achievements?.map((pa) => (
              <div key={pa.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{pa.achievement.name}</p>
                  <p className="text-xs text-muted-foreground">{pa.achievement.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mensalidades</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.monthlyFees.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma mensalidade gerada ainda.</p>}
          <div className="flex flex-col gap-2">
            {stats?.monthlyFees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span>{fee.referenceMonth}</span>
                <span className="font-semibold">{formatCurrency(fee.amount)}</span>
                <Badge variant={fee.status === "PAGO" ? "success" : "outline"}>
                  {fee.status === "PAGO" ? `Pago (${fee.paidAt ? formatDate(fee.paidAt) : ""})` : "Em aberto"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {canEdit && <PlayerEditDialog player={player} open={editOpen} onOpenChange={setEditOpen} isAdmin={isAdmin} />}
      {isAdmin && <CreateLoginDialog playerId={player.id} open={loginOpen} onOpenChange={setLoginOpen} />}
      {isAdmin && <ResetPasswordDialog playerId={player.id} open={resetPasswordOpen} onOpenChange={setResetPasswordOpen} />}
    </div>
  );
}
