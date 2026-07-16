import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ListOrdered, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as waitlistService from "@/services/waitlist.service";
import { getErrorMessage } from "@/services/api";
import { PlayerType } from "@/types";

const createSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  whatsapp: z.string().min(8, "WhatsApp inválido"),
  city: z.string().min(2, "Cidade obrigatória"),
});
type CreateFormData = z.infer<typeof createSchema>;

export default function WaitlistPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveType, setApproveType] = useState<PlayerType>("LINHA");

  const { data: entries, isLoading } = useQuery({ queryKey: ["waitlist"], queryFn: waitlistService.listWaitlist });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: zodResolver(createSchema) });

  const createMutation = useMutation({
    mutationFn: waitlistService.createWaitlistEntry,
    onSuccess: () => {
      toast.success("Adicionado à fila de espera!");
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      reset();
      setCreateOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: PlayerType }) => waitlistService.approveWaitlistEntry(id, type),
    onSuccess: () => {
      toast.success("Jogador aprovado e cadastrado!");
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      setApprovingId(null);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: waitlistService.deleteWaitlistEntry,
    onSuccess: () => {
      toast.success("Removido da fila.");
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Candidatos aguardando vaga na patota, em ordem de chegada.</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Adicionar à fila
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : entries?.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <ListOrdered className="h-8 w-8" />
          <p>Fila de espera vazia.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries?.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="h-8 w-8 justify-center rounded-full p-0 text-sm">
                    {entry.position}
                  </Badge>
                  <div>
                    <p className="font-semibold">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.whatsapp} · {entry.city}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setApprovingId(entry.id)}>
                    <Check className="h-4 w-4" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`Remover ${entry.name} da fila?`)) deleteMutation.mutate(entry.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar à fila de espera</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" placeholder="5511999999999" {...register("whatsapp")} />
              {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!approvingId} onOpenChange={(v) => !v && setApprovingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar candidato</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Posição do jogador</Label>
              <Select value={approveType} onValueChange={(v) => setApproveType(v as PlayerType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LINHA">Jogador de Linha (R$60)</SelectItem>
                  <SelectItem value="GOLEIRO">Goleiro (R$30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                disabled={approveMutation.isPending}
                onClick={() => approvingId && approveMutation.mutate({ id: approvingId, type: approveType })}
              >
                {approveMutation.isPending ? "Aprovando..." : "Confirmar aprovação"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
