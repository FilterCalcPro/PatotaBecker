import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Save, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DroppableColumn } from "./DroppableColumn";
import { TeamMember, guestDndId, playerDndId } from "./teamMember";
import * as teamsService from "@/services/teams.service";
import { getErrorMessage } from "@/services/api";
import { MatchDetail } from "@/types";

type ColumnId = "pool" | "teamA" | "teamB";

function buildColumns(match: MatchDetail): Record<ColumnId, TeamMember[]> {
  const confirmedPlayers: TeamMember[] = match.attendances
    .filter((a) => a.status === "CONFIRMADO")
    .map((a) => ({
      id: a.player.id,
      dndId: playerDndId(a.player.id),
      kind: "PLAYER",
      name: a.player.name,
      nickname: a.player.nickname,
      photoUrl: a.player.photoUrl,
      type: a.player.type,
      overall: a.player.overall,
    }));

  const guestMembers: TeamMember[] = match.guests.map((mg) => ({
    id: mg.guest.id,
    dndId: guestDndId(mg.guest.id),
    kind: "GUEST",
    name: mg.guest.name,
    nickname: mg.guest.name,
    photoUrl: null,
  }));

  const allMembers = [...confirmedPlayers, ...guestMembers];
  const memberByDndId = new Map(allMembers.map((m) => [m.dndId, m]));

  const teamAIds = new Set(
    match.teams[0]?.players.map((tp) => (tp.playerId ? playerDndId(tp.playerId) : guestDndId(tp.guestId!))) ?? []
  );
  const teamBIds = new Set(
    match.teams[1]?.players.map((tp) => (tp.playerId ? playerDndId(tp.playerId) : guestDndId(tp.guestId!))) ?? []
  );

  const teamA = [...teamAIds].map((dndId) => memberByDndId.get(dndId)).filter((m): m is TeamMember => !!m);
  const teamB = [...teamBIds].map((dndId) => memberByDndId.get(dndId)).filter((m): m is TeamMember => !!m);
  const pool = allMembers.filter((m) => !teamAIds.has(m.dndId) && !teamBIds.has(m.dndId));

  return { pool, teamA, teamB };
}

export function TeamsTab({ match, isAdmin }: { match: MatchDetail; isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [columns, setColumns] = useState<Record<ColumnId, TeamMember[]>>(() => buildColumns(match));

  useEffect(() => {
    setColumns(buildColumns(match));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.teams, match.attendances, match.guests]);

  const balanceMutation = useMutation({
    mutationFn: () => teamsService.autoBalanceTeams(match.id),
    onSuccess: () => {
      toast.success("Times montados automaticamente!");
      queryClient.invalidateQueries({ queryKey: ["match", match.id] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const split = (members: TeamMember[]) => ({
        playerIds: members.filter((m) => m.kind === "PLAYER").map((m) => m.id),
        guestIds: members.filter((m) => m.kind === "GUEST").map((m) => m.id),
      });
      return teamsService.saveTeams(match.id, [
        { name: "Time A", color: "#22c55e", ...split(columns.teamA) },
        { name: "Time B", color: "#3b82f6", ...split(columns.teamB) },
      ]);
    },
    onSuccess: () => {
      toast.success("Times salvos!");
      queryClient.invalidateQueries({ queryKey: ["match", match.id] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const clearMutation = useMutation({
    mutationFn: () => teamsService.clearTeams(match.id),
    onSuccess: () => {
      toast.success("Times desfeitos! Todos voltaram para confirmados sem time.");
      queryClient.invalidateQueries({ queryKey: ["match", match.id] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const targetColumn = over.id as ColumnId;
    const dndId = active.id as string;

    setColumns((prev) => {
      const sourceColumn = (Object.keys(prev) as ColumnId[]).find((key) => prev[key].some((m) => m.dndId === dndId));
      if (!sourceColumn || sourceColumn === targetColumn) return prev;

      const member = prev[sourceColumn].find((m) => m.dndId === dndId)!;
      return {
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter((m) => m.dndId !== dndId),
        [targetColumn]: [...prev[targetColumn], member],
      };
    });
  }

  const totalAvailable = columns.pool.length + columns.teamA.length + columns.teamB.length;

  if (totalAvailable === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhum jogador confirmado ou convidado neste jogo ainda para montar os times.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => balanceMutation.mutate()} disabled={balanceMutation.isPending}>
            <Shuffle className="h-4 w-4" /> Montar Times
          </Button>
          <Button variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" /> Salvar arranjo
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            disabled={clearMutation.isPending || (columns.teamA.length === 0 && columns.teamB.length === 0)}
            onClick={() => {
              if (confirm("Desfazer os times? Todos os jogadores e convidados voltam para a lista de confirmados sem time.")) {
                clearMutation.mutate();
              }
            }}
          >
            <RotateCcw className="h-4 w-4" /> Desfazer Times
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={isAdmin ? handleDragEnd : undefined}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DroppableColumn id="pool" title="Confirmados sem time" members={columns.pool} disabled={!isAdmin} />
          <DroppableColumn id="teamA" title="Time A" color="#22c55e" members={columns.teamA} disabled={!isAdmin} />
          <DroppableColumn id="teamB" title="Time B" color="#3b82f6" members={columns.teamB} disabled={!isAdmin} />
        </div>
      </DndContext>
    </div>
  );
}
