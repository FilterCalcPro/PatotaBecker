import { Link } from "react-router-dom";
import { Shield, Swords } from "lucide-react";
import { Player } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { OverallBadge } from "@/components/shared/OverallBadge";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <Link to={`/jogadores/${player.id}`}>
      <Card className="group relative overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-overall opacity-20 transition-opacity group-hover:opacity-30" />
        <div className="relative flex flex-col items-center gap-3 p-5">
          <OverallBadge overall={player.overall} size="lg" />
          <PlayerAvatar name={player.name} photoUrl={player.photoUrl} className="h-16 w-16 border-2 border-border" />
          <div className="text-center">
            <p className="font-bold leading-tight">{player.nickname}</p>
            <p className="text-xs text-muted-foreground">{player.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {player.type === "GOLEIRO" ? <Shield className="h-3 w-3" /> : <Swords className="h-3 w-3" />}
              {player.type === "GOLEIRO" ? "Goleiro" : "Linha"}
            </Badge>
            {player.status === "INATIVO" && <Badge variant="destructive">Inativo</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
