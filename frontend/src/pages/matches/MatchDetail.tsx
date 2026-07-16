import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceTab } from "@/components/matches/AttendanceTab";
import { TeamsTab } from "@/components/matches/TeamsTab";
import { ResultTab } from "@/components/matches/ResultTab";
import { VotingTab } from "@/components/matches/VotingTab";
import { useAuth } from "@/hooks/useAuth";
import * as matchesService from "@/services/matches.service";
import { getErrorMessage } from "@/services/api";
import { formatDateLong } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", id],
    queryFn: () => matchesService.getMatch(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => matchesService.deleteMatch(id!),
    onSuccess: () => {
      toast.success("Jogo removido.");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      navigate("/jogos");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (isLoading || !match) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold capitalize">{formatDateLong(match.date)}</h2>
            <Badge variant={match.closed ? "outline" : "success"}>{match.closed ? "Encerrado" : "Em aberto"}</Badge>
            <Badge variant="secondary">{match.format === "SEIS" ? "6x6" : "7x7"}</Badge>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {match.time} · <MapPin className="h-3.5 w-3.5" /> {match.location}
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="outline"
            className="w-fit text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm("Remover este jogo definitivamente?")) deleteMutation.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" /> Excluir jogo
          </Button>
        )}
      </div>

      <Tabs defaultValue="presenca">
        <TabsList>
          <TabsTrigger value="presenca">Presença</TabsTrigger>
          <TabsTrigger value="times">Times</TabsTrigger>
          <TabsTrigger value="resultado">Resultado</TabsTrigger>
          <TabsTrigger value="votacao">Votação</TabsTrigger>
        </TabsList>

        <TabsContent value="presenca">
          <AttendanceTab match={match} isAdmin={isAdmin} myPlayerId={user?.player?.id} />
        </TabsContent>
        <TabsContent value="times">
          <TeamsTab match={match} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="resultado">
          <ResultTab match={match} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="votacao">
          <VotingTab match={match} myPlayerId={user?.player?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
