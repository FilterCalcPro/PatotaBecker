import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GuestFormDialog } from "@/components/guests/GuestFormDialog";
import * as guestsService from "@/services/guests.service";
import { getErrorMessage } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { Guest } from "@/types";

export default function GuestsList() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);

  const { data: guests, isLoading } = useQuery({ queryKey: ["guests"], queryFn: guestsService.listGuests });

  const deleteMutation = useMutation({
    mutationFn: guestsService.deleteGuest,
    onSuccess: () => {
      toast.success("Convidado removido.");
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Convidados cadastrados para participar dos jogos (R$15 por padrão).</p>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Novo Convidado
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : guests?.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <UserPlus className="h-8 w-8" />
          <p>Nenhum convidado cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guests?.map((guest) => (
            <Card key={guest.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{guest.name}</p>
                  <p className="text-xs text-muted-foreground">{guest.whatsapp || "Sem WhatsApp"}</p>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {guest.defaultFee != null ? formatCurrency(guest.defaultFee) : "Padrão (R$15)"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(guest);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`Remover ${guest.name}?`)) deleteMutation.mutate(guest.id);
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

      <GuestFormDialog open={formOpen} onOpenChange={setFormOpen} guest={editing} />
    </div>
  );
}
