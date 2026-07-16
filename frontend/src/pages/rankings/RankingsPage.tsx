import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Award, Crosshair, Flame, Goal, HandHeart, Shield, Trophy, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import * as rankingsService from "@/services/rankings.service";
import * as achievementsService from "@/services/achievements.service";
import { cn } from "@/lib/utils";

const RANKING_TYPES: { value: rankingsService.RankingType; label: string; icon: typeof Trophy; suffix?: string }[] = [
  { value: "overall", label: "Overall", icon: Trophy },
  { value: "goals", label: "Artilheiros", icon: Goal },
  { value: "assists", label: "Assistências", icon: HandHeart },
  { value: "mvp", label: "MVP", icon: Trophy },
  { value: "top-scorer", label: "Melhor Marcador", icon: Crosshair },
  { value: "best-gk", label: "Melhor Goleiro", icon: Shield },
  { value: "presences", label: "Mais Presenças", icon: UserCheck },
  { value: "streak", label: "Maior Sequência", icon: Flame },
];

export default function RankingsPage() {
  const [type, setType] = useState<rankingsService.RankingType>("overall");
  const { data: ranking, isLoading } = useQuery({ queryKey: ["ranking", type], queryFn: () => rankingsService.getRanking(type) });
  const { data: achievements } = useQuery({ queryKey: ["achievements"], queryFn: achievementsService.listAchievements });

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={type} onValueChange={(v) => setType(v as rankingsService.RankingType)}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          {RANKING_TYPES.map((rt) => (
            <TabsTrigger key={rt.value} value={rt.value} className="gap-1.5">
              <rt.icon className="h-3.5 w-3.5" /> {rt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="flex flex-col gap-1 p-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)
          ) : ranking?.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Ainda não há dados suficientes para este ranking.</p>
          ) : (
            ranking?.map((entry, index) => (
              <Link
                key={entry.player.id}
                to={`/jogadores/${entry.player.id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    index === 0 && "bg-amber-500/20 text-amber-400",
                    index === 1 && "bg-slate-400/20 text-slate-300",
                    index === 2 && "bg-orange-700/20 text-orange-400",
                    index > 2 && "text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
                <PlayerAvatar name={entry.player.name} photoUrl={entry.player.photoUrl} className="h-9 w-9" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{entry.player.nickname}</p>
                  <p className="truncate text-xs text-muted-foreground">{entry.player.name}</p>
                </div>
                <span className="text-lg font-bold text-primary">{entry.value}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Award className="h-4 w-4 text-primary" /> Catálogo de Conquistas
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {achievements?.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Award className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
