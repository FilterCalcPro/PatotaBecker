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
import { Switch } from "@/components/ui/switch";
import * as playersService from "@/services/players.service";
import { getErrorMessage } from "@/services/api";

const schema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    nickname: z.string().min(1, "Apelido obrigatório"),
    whatsapp: z.string().min(8, "WhatsApp inválido"),
    photoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
    type: z.enum(["LINHA", "GOLEIRO"]),
    createLogin: z.boolean(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
  })
  .refine((data) => !data.createLogin || (data.email && data.password), {
    message: "E-mail e senha são obrigatórios para criar login",
    path: ["email"],
  });

type FormData = z.infer<typeof schema>;

export function PlayerFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "LINHA", createLogin: false },
  });

  const createLogin = watch("createLogin");

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      playersService.createPlayer({
        name: data.name,
        nickname: data.nickname,
        whatsapp: data.whatsapp,
        photoUrl: data.photoUrl || undefined,
        type: data.type,
        createLogin: data.createLogin,
        email: data.email || undefined,
        password: data.password || undefined,
      }),
    onSuccess: () => {
      toast.success("Jogador cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["players"] });
      reset();
      onOpenChange(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Jogador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nickname">Apelido</Label>
              <Input id="nickname" {...register("nickname")} />
              {errors.nickname && <p className="text-xs text-destructive">{errors.nickname.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" placeholder="5511999999999" {...register("whatsapp")} />
              {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photoUrl">URL da foto (opcional)</Label>
            <Input id="photoUrl" placeholder="https://..." {...register("photoUrl")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINHA">Jogador de Linha (R$60)</SelectItem>
                    <SelectItem value="GOLEIRO">Goleiro (R$30)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Criar acesso de login</p>
              <p className="text-xs text-muted-foreground">Permite ao jogador confirmar presença e votar</p>
            </div>
            <Controller
              control={control}
              name="createLogin"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          {createLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Cadastrar jogador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
