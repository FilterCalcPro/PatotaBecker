import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trophy, Goal, Shield, Vote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import * as votingService from "@/services/voting.service";
import { getErrorMessage } from "@/services/api";
import { MatchDetail } from "@/types";

const schema = z
  .object({
    mvpFirst: z.string().min(1, "Selecione o 1º lugar"),
    mvpSecond: z.string().min(1, "Selecione o 2º lugar"),
    mvpThird: z.string().min(1, "Selecione o 3º lugar"),
    topScorer: z.string().min(1, "Selecione o melhor marcador"),
    bestGoalkeeper: z.string().min(1, "Selecione o melhor goleiro"),
  })
  .refine((d) => new Set([d.mvpFirst, d.mvpSecond, d.mvpThird]).size === 3, {
    message: "As três escolhas de MVP devem ser jogadores diferentes",
    path: ["mvpThird"],
  });
type FormData = z.infer<typeof schema>;

export function VotingTab({ match, myPlayerId }: { match: MatchDetail; myPlayerId?: string }) {
  const queryClient = useQueryClient();
  const attendees = match.attendances.filter((a) => a.attended).map((a) => a.player);
  const goalkeepers = attendees.filter((p) => p.type === "GOLEIRO");
  const myAttendance = match.attendances.find((a) => a.playerId === myPlayerId);
  const canVote = !!myAttendance?.attended;

  const { data: myVote } = useQuery({
    queryKey: ["my-vote", match.id],
    queryFn: () => votingService.getMyVote(match.id),
    enabled: canVote,
  });

  const { data: results } = useQuery({
    queryKey: ["vote-results", match.id],
    queryFn: () => votingService.getVoteResults(match.id),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const voteMutation = useMutation({
    mutationFn: (data: FormData) => votingService.castVote(match.id, data),
    onSuccess: () => {
      toast.success("Voto registrado. Obrigado por participar!");
      queryClient.invalidateQueries({ queryKey: ["my-vote", match.id] });
      queryClient.invalidateQueries({ queryKey: ["vote-results", match.id] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div className="flex flex-col gap-6">
      {myPlayerId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-primary" /> Sua votação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!canVote && <p className="text-sm text-muted-foreground">Somente quem compareceu ao jogo pode votar.</p>}
            {canVote && myVote?.hasVoted && <p className="text-sm text-success">Você já votou neste jogo. Obrigado!</p>}
            {canVote && !myVote?.hasVoted && (
              <form onSubmit={handleSubmit((data) => voteMutation.mutate(data))} className="flex flex-col gap-4">
                <div>
                  <Label className="mb-2 block">MVP do jogo</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(["mvpFirst", "mvpSecond", "mvpThird"] as const).map((field, idx) => (
                      <div key={field} className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{idx + 1}º lugar</span>
                        <Controller
                          control={control}
                          name={field}
                          render={({ field: f }) => (
                            <Select value={f.value} onValueChange={f.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {attendees.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.nickname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.mvpThird && <p className="mt-1 text-xs text-destructive">{errors.mvpThird.message}</p>}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <Label>Melhor Marcador</Label>
                    <Controller
                      control={control}
                      name="topScorer"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {attendees.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nickname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Melhor Goleiro</Label>
                    <Controller
                      control={control}
                      name="bestGoalkeeper"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {goalkeepers.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nickname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {goalkeepers.length === 0 && <p className="text-xs text-muted-foreground">Nenhum goleiro compareceu.</p>}
                  </div>
                </div>

                <Button type="submit" disabled={voteMutation.isPending || goalkeepers.length === 0} className="w-fit">
                  Confirmar voto
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resultado da votação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" /> MVP
            </p>
            <div className="flex flex-col gap-2">
              {results?.mvp.length === 0 && <p className="text-xs text-muted-foreground">Sem votos ainda.</p>}
              {results?.mvp.map((entry) => (
                <div key={entry.candidateId} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">{entry.placement}º</span>
                  <PlayerAvatar name={entry.player?.name ?? ""} photoUrl={entry.player?.photoUrl} className="h-6 w-6" />
                  <span className="text-sm">{entry.player?.nickname}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Goal className="h-3.5 w-3.5" /> Melhor Marcador
            </p>
            {results?.topScorer ? (
              <div className="flex items-center gap-2">
                <PlayerAvatar name={results.topScorer.name} photoUrl={results.topScorer.photoUrl} className="h-6 w-6" />
                <span className="text-sm">{results.topScorer.nickname}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem votos ainda.</p>
            )}
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Shield className="h-3.5 w-3.5" /> Melhor Goleiro
            </p>
            {results?.bestGoalkeeper ? (
              <div className="flex items-center gap-2">
                <PlayerAvatar name={results.bestGoalkeeper.name} photoUrl={results.bestGoalkeeper.photoUrl} className="h-6 w-6" />
                <span className="text-sm">{results.bestGoalkeeper.nickname}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem votos ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
