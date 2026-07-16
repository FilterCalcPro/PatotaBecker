import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as playersService from "@/services/players.service";
import { getErrorMessage } from "@/services/api";
import { Player } from "@/types";

const fullSchema = z.object({
  name: z.string().min(2),
  nickname: z.string().min(1),
  whatsapp: z.string().min(8),
  photoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  type: z.enum(["LINHA", "GOLEIRO"]),
});

const selfSchema = z.object({
  nickname: z.string().min(1),
  photoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type FullFormData = z.infer<typeof fullSchema>;

export function PlayerEditDialog({
  player,
  open,
  onOpenChange,
  isAdmin,
}: {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}) {
  const queryClient = useQueryClient();
  const schema = isAdmin ? fullSchema : selfSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FullFormData>({
    resolver: zodResolver(schema as typeof fullSchema),
    defaultValues: {
      name: player.name,
      nickname: player.nickname,
      whatsapp: player.whatsapp,
      photoUrl: player.photoUrl ?? "",
      type: player.type,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<FullFormData>) =>
      playersService.updatePlayer(player.id, { ...data, photoUrl: data.photoUrl || undefined }),
    onSuccess: () => {
      toast.success("Perfil atualizado!");
      queryClient.invalidateQueries({ queryKey: ["player", player.id] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      onOpenChange(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {isAdmin ? "jogador" : "meu perfil"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          {isAdmin && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nickname">Apelido</Label>
            <Input id="nickname" {...register("nickname")} />
            {errors.nickname && <p className="text-xs text-destructive">{errors.nickname.message}</p>}
          </div>
          {isAdmin && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" {...register("whatsapp")} />
              {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photoUrl">URL da foto</Label>
            <Input id="photoUrl" placeholder="https://..." {...register("photoUrl")} />
          </div>
          {isAdmin && (
            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LINHA">Jogador de Linha (R$60)</SelectItem>
                      <SelectItem value="GOLEIRO">Goleiro (R$30)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
