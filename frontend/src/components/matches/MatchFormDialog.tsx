import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as matchesService from "@/services/matches.service";
import { getErrorMessage } from "@/services/api";

const schema = z.object({
  date: z.string().min(1, "Informe a data"),
  time: z.string().min(1, "Informe o horário"),
  location: z.string().min(2, "Informe o local"),
  courtCost: z.coerce.number().nonnegative("Valor inválido"),
  format: z.enum(["SEIS", "SETE"]),
});
type FormData = z.infer<typeof schema>;

export function MatchFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { format: "SEIS", courtCost: 0 } });

  const mutation = useMutation({
    mutationFn: (data: FormData) => matchesService.createMatch({ ...data, date: new Date(data.date).toISOString() }),
    onSuccess: (match) => {
      toast.success("Jogo criado! Jogadores foram notificados.");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      reset();
      onOpenChange(false);
      navigate(`/jogos/${match.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Jogo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" {...register("time")} />
              {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Local</Label>
            <Input id="location" placeholder="Quadra do Becker" {...register("location")} />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="courtCost">Valor da quadra (R$)</Label>
              <Input id="courtCost" type="number" step="0.01" {...register("courtCost")} />
              {errors.courtCost && <p className="text-xs text-destructive">{errors.courtCost.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Formato</Label>
              <Controller
                control={control}
                name="format"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEIS">6x6</SelectItem>
                      <SelectItem value="SETE">7x7</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Criando..." : "Criar jogo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
