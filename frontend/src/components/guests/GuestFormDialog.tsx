import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as guestsService from "@/services/guests.service";
import { getErrorMessage } from "@/services/api";
import { Guest } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  whatsapp: z.string().optional(),
  defaultFee: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().positive("Valor deve ser positivo").optional()
  ),
});

type FormData = z.infer<typeof schema>;

export function GuestFormDialog({
  open,
  onOpenChange,
  guest,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Guest | null;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset(
        guest
          ? { name: guest.name, whatsapp: guest.whatsapp ?? "", defaultFee: guest.defaultFee ?? undefined }
          : { name: "", whatsapp: "", defaultFee: undefined }
      );
    }
  }, [open, guest, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => (guest ? guestsService.updateGuest(guest.id, data) : guestsService.createGuest(data)),
    onSuccess: () => {
      toast.success(guest ? "Convidado atualizado!" : "Convidado cadastrado!");
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      onOpenChange(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{guest ? "Editar convidado" : "Novo convidado"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
            <Input id="whatsapp" placeholder="5511999999999" {...register("whatsapp")} />
            {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="defaultFee">Valor padrão (R$, opcional)</Label>
            <Input id="defaultFee" type="number" step="0.01" placeholder="15,00" {...register("defaultFee")} />
            {errors.defaultFee && <p className="text-xs text-destructive">{errors.defaultFee.message}</p>}
            <p className="text-xs text-muted-foreground">Se deixado em branco, será usado o valor padrão de R$15 ao adicionar o convidado a um jogo.</p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
