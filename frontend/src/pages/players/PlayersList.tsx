import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerCard } from "@/components/players/PlayerCard";
import { PlayerFormDialog } from "@/components/players/PlayerFormDialog";
import { useAuth } from "@/hooks/useAuth";
import * as playersService from "@/services/players.service";
import { PlayerStatus } from "@/types";

export default function PlayersList() {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState<PlayerStatus | "TODOS">("ATIVO");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const { data: players, isLoading } = useQuery({
    queryKey: ["players", status],
    queryFn: () => playersService.listPlayers(status === "TODOS" ? undefined : status),
  });

  const filtered = useMemo(() => {
    if (!players) return [];
    const term = search.trim().toLowerCase();
    if (!term) return players;
    return players.filter(
      (p) => p.name.toLowerCase().includes(term) || p.nickname.toLowerCase().includes(term)
    );
  }, [players, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v as PlayerStatus | "TODOS")}>
          <TabsList>
            <TabsTrigger value="ATIVO">Ativos</TabsTrigger>
            <TabsTrigger value="INATIVO">Inativos</TabsTrigger>
            <TabsTrigger value="TODOS">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar jogador..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {isAdmin && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" /> Novo Jogador
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Nenhum jogador encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}

      {isAdmin && <PlayerFormDialog open={formOpen} onOpenChange={setFormOpen} />}
    </div>
  );
}
