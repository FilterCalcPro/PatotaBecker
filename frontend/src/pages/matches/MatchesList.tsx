import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchFormDialog } from "@/components/matches/MatchFormDialog";
import { useAuth } from "@/hooks/useAuth";
import * as matchesService from "@/services/matches.service";
import { formatDateLong } from "@/lib/utils";

export default function MatchesList() {
  const { isAdmin } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const { data: matches, isLoading } = useQuery({ queryKey: ["matches"], queryFn: matchesService.listMatches });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Jogos da patota, geralmente às quintas-feiras.</p>
        {isAdmin && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Novo Jogo
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : matches?.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <CalendarDays className="h-8 w-8" />
          <p>Nenhum jogo cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches?.map((match) => (
            <Link key={match.id} to={`/jogos/${match.id}`}>
              <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant={match.closed ? "outline" : "success"}>{match.closed ? "Encerrado" : "Em aberto"}</Badge>
                    <Badge variant="secondary">{match.format === "SEIS" ? "6x6" : "7x7"}</Badge>
                  </div>
                  <div>
                    <p className="text-lg font-bold capitalize">{formatDateLong(match.date)}</p>
                    <p className="text-sm text-muted-foreground">{match.time}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {match.location}
                  </div>
                  {match.result && (
                    <p className="text-sm font-semibold text-primary">
                      Placar: {match.result.teamAGoals} x {match.result.teamBGoals}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {isAdmin && <MatchFormDialog open={formOpen} onOpenChange={setFormOpen} />}
    </div>
  );
}
