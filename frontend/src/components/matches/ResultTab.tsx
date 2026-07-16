import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, Minus, Play, Plus, RefreshCw, Save, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import * as statsService from "@/services/stats.service";
import * as matchesService from "@/services/matches.service";
import { getErrorMessage } from "@/services/api";
import { MatchDetail, Team } from "@/types";

interface Member {
  id: string;
  kind: "PLAYER" | "GUEST";
  name: string;
  nickname: string;
  photoUrl: string | null;
}

function teamMembers(team?: Team): Member[] {
  if (!team) return [];
  return team.players.map((tp) =>
    tp.player
      ? { id: tp.player.id, kind: "PLAYER" as const, name: tp.player.name, nickname: tp.player.nickname, photoUrl: tp.player.photoUrl }
      : { id: tp.guest!.id, kind: "GUEST" as const, name: tp.guest!.name, nickname: tp.guest!.name, photoUrl: null }
  );
}

export function ResultTab({ match, isAdmin }: { match: MatchDetail; isAdmin: boolean }) {
  const queryClient = useQueryClient();

  const [teamAName, setTeamAName] = useState(match.result?.teamAName ?? match.teams[0]?.name ?? "Time A");
  const [teamAGoalsInput, setTeamAGoalsInput] = useState(match.result?.teamAGoals ?? 0);
  const [teamBName, setTeamBName] = useState(match.result?.teamBName ?? match.teams[1]?.name ?? "Time B");
  const [teamBGoalsInput, setTeamBGoalsInput] = useState(match.result?.teamBGoals ?? 0);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["match", match.id] });
  }

  const startMutation = useMutation({
    mutationFn: () => matchesService.startMatch(match.id),
    onSuccess: () => {
      toast.success("Partida iniciada! Jogadores escalados marcados como presentes.");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const incrementMutation = useMutation({
    mutationFn: (payload: { playerId?: string; guestId?: string; field: "goals" | "assists"; delta: 1 | -1 }) =>
      statsService.incrementStat(match.id, payload),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const resultMutation = useMutation({
    mutationFn: () =>
      statsService.setMatchResult(match.id, { teamAName, teamAGoals: teamAGoalsInput, teamBName, teamBGoals: teamBGoalsInput }),
    onSuccess: () => {
      toast.success("Placar salvo!");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const closeMutation = useMutation({
    mutationFn: () => matchesService.closeMatch(match.id),
    onSuccess: () => {
      toast.success("Jogo fechado! Overall dos jogadores recalculado.");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const recalculateMutation = useMutation({
    mutationFn: () => matchesService.recalculateMatch(match.id),
    onSuccess: () => {
      toast.success("Overall recalculado com as estatísticas atuais!");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  function statFor(memberId: string) {
    const stat = match.stats.find((s) => s.playerId === memberId || s.guestId === memberId);
    return { goals: stat?.goals ?? 0, assists: stat?.assists ?? 0 };
  }

  const teamAMembers = teamMembers(match.teams[0]);
  const teamBMembers = teamMembers(match.teams[1]);
  const hasTeams = teamAMembers.length > 0 && teamBMembers.length > 0;

  const liveTeamAGoals = teamAMembers.reduce((sum, m) => sum + statFor(m.id).goals, 0);
  const liveTeamBGoals = teamBMembers.reduce((sum, m) => sum + statFor(m.id).goals, 0);
  const anyAttended = match.attendances.some((a) => a.attended);

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {match.result ? (
            <p className="text-lg font-bold">
              {match.result.teamAName} {match.result.teamAGoals} x {match.result.teamBGoals} {match.result.teamBName}
            </p>
          ) : hasTeams ? (
            <p className="text-lg font-bold">
              {match.teams[0].name} {liveTeamAGoals} x {liveTeamBGoals} {match.teams[1].name}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Resultado ainda não registrado.</p>
          )}
          {match.stats.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {match.stats.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span>{s.player?.nickname ?? s.guest?.name}</span>
                  <span className="text-muted-foreground">
                    {s.goals} gols · {s.assists} assist.
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!hasTeams) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Monte os times na aba Times antes de registrar o resultado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!anyAttended && (
        <Card className="border-primary/40">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Pronto pra começar?</p>
              <p className="text-sm text-muted-foreground">
                Inicia a partida marcando todos os jogadores escalados como presentes e libera o placar ao vivo.
              </p>
            </div>
            <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
              <Play className="h-4 w-4" /> Iniciar Partida
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TeamScoreboard
          teamName={match.teams[0].name}
          color={match.teams[0].color}
          members={teamAMembers}
          score={liveTeamAGoals}
          statFor={statFor}
          onIncrement={(memberId, kind, field, delta) =>
            incrementMutation.mutate({ [kind === "PLAYER" ? "playerId" : "guestId"]: memberId, field, delta })
          }
        />
        <TeamScoreboard
          teamName={match.teams[1].name}
          color={match.teams[1].color}
          members={teamBMembers}
          score={liveTeamBGoals}
          statFor={statFor}
          onIncrement={(memberId, kind, field, delta) =>
            incrementMutation.mutate({ [kind === "PLAYER" ? "playerId" : "guestId"]: memberId, field, delta })
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placar final</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Placar ao vivo (soma dos gols lançados): {teamAName} {liveTeamAGoals} x {liveTeamBGoals} {teamBName}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{teamAName}</Label>
              <Input type="number" value={teamAGoalsInput} onChange={(e) => setTeamAGoalsInput(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{teamBName}</Label>
              <Input type="number" value={teamBGoalsInput} onChange={(e) => setTeamBGoalsInput(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTeamAGoalsInput(liveTeamAGoals);
                setTeamBGoalsInput(liveTeamBGoals);
              }}
            >
              Usar placar ao vivo
            </Button>
            <Button onClick={() => resultMutation.mutate()} disabled={resultMutation.isPending}>
              <Save className="h-4 w-4" /> Salvar placar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={match.closed ? "border-muted" : "border-primary/40"}>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="font-semibold">{match.closed ? "Jogo encerrado" : "Fechar jogo"}</p>
            <p className="text-sm text-muted-foreground">
              {match.closed
                ? "O overall dos jogadores já foi recalculado com base neste jogo."
                : "Ao fechar, o overall dos jogadores é recalculado com base em gols, assistências, presença e votação."}
            </p>
          </div>
          <Button
            variant={match.closed ? "outline" : "default"}
            disabled={match.closed || closeMutation.isPending}
            onClick={() => {
              if (confirm("Fechar este jogo e recalcular o overall dos jogadores?")) closeMutation.mutate();
            }}
          >
            <Lock className="h-4 w-4" /> {match.closed ? "Fechado" : "Fechar jogo"}
          </Button>
        </CardContent>
      </Card>

      {match.closed && (
        <Card className="border-primary/40">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Corrigiu algum gol ou assistência?</p>
              <p className="text-sm text-muted-foreground">
                Como o jogo já foi fechado, o overall não se ajusta sozinho. Depois de corrigir a estatística acima,
                clique aqui para recalcular o overall dos jogadores com os números certos.
              </p>
            </div>
            <Button
              variant="outline"
              disabled={recalculateMutation.isPending}
              onClick={() => recalculateMutation.mutate()}
            >
              <RefreshCw className="h-4 w-4" /> Recalcular Overall
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeamScoreboard({
  teamName,
  color,
  members,
  score,
  statFor,
  onIncrement,
}: {
  teamName: string;
  color: string;
  members: Member[];
  score: number;
  statFor: (memberId: string) => { goals: number; assists: number };
  onIncrement: (memberId: string, kind: "PLAYER" | "GUEST", field: "goals" | "assists", delta: 1 | -1) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          {teamName}
        </CardTitle>
        <span className="text-3xl font-black tabular-nums">{score}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {members.map((member) => {
          const stat = statFor(member.id);
          return (
            <div key={member.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
              <PlayerAvatar name={member.name} photoUrl={member.photoUrl} className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.nickname}</p>
                {member.kind === "GUEST" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                    <UserRound className="h-3 w-3" /> Convidado
                  </span>
                )}
              </div>

              <StatCounter
                label="Gols"
                value={stat.goals}
                onDecrement={() => onIncrement(member.id, member.kind, "goals", -1)}
                onIncrement={() => onIncrement(member.id, member.kind, "goals", 1)}
              />
              <StatCounter
                label="Assist."
                value={stat.assists}
                onDecrement={() => onIncrement(member.id, member.kind, "assists", -1)}
                onIncrement={() => onIncrement(member.id, member.kind, "assists", 1)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function StatCounter({
  label,
  value,
  onIncrement,
  onDecrement,
}: {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="outline" className="h-6 w-6" disabled={value === 0} onClick={onDecrement}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-4 text-center text-sm font-bold tabular-nums">{value}</span>
        <Button size="icon" variant="outline" className="h-6 w-6" onClick={onIncrement}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
