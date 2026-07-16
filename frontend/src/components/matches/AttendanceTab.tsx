import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as matchesService from "@/services/matches.service";
import * as guestsService from "@/services/guests.service";
import { getErrorMessage } from "@/services/api";
import { MatchDetail } from "@/types";
import { formatCurrency } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = { CONFIRMADO: "Vou", RECUSADO: "Não vou", PENDENTE: "Pendente" };

export function AttendanceTab({ match, isAdmin, myPlayerId }: { match: MatchDetail; isAdmin: boolean; myPlayerId?: string }) {
  const queryClient = useQueryClient();
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");

  const { data: guests } = useQuery({ queryKey: ["guests"], queryFn: guestsService.listGuests, enabled: isAdmin });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["match", match.id] });
  }

  const overrideMutation = useMutation({
    mutationFn: ({ playerId, status }: { playerId: string; status: string }) =>
      matchesService.overrideAttendance(match.id, playerId, status),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const checkinMutation = useMutation({
    mutationFn: ({ playerId, attended }: { playerId: string; attended: boolean }) =>
      matchesService.checkinAttendance(match.id, playerId, attended),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const myAttendanceMutation = useMutation({
    mutationFn: (status: "CONFIRMADO" | "RECUSADO") => matchesService.setOwnAttendance(match.id, status),
    onSuccess: () => {
      toast.success("Presença atualizada!");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const addGuestMutation = useMutation({
    mutationFn: (guestId: string) => matchesService.addGuestToMatch(match.id, guestId),
    onSuccess: () => {
      toast.success("Convidado adicionado ao jogo!");
      invalidate();
      setGuestDialogOpen(false);
      setSelectedGuestId("");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const guestPaidMutation = useMutation({
    mutationFn: ({ guestId, paid }: { guestId: string; paid: boolean }) => matchesService.setGuestPaid(match.id, guestId, paid),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const removeGuestMutation = useMutation({
    mutationFn: (guestId: string) => matchesService.removeGuestFromMatch(match.id, guestId),
    onSuccess: () => {
      toast.success("Convidado removido do jogo.");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const myAttendance = match.attendances.find((a) => a.playerId === myPlayerId);
  const availableGuests = guests?.filter((g) => !match.guests.some((mg) => mg.guestId === g.id)) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {myPlayerId && !isAdmin && (
        <Card className="border-primary/40">
          <CardContent className="flex flex-col items-center gap-3 p-5 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sua confirmação de presença</p>
              <Badge variant={myAttendance?.status === "CONFIRMADO" ? "success" : myAttendance?.status === "RECUSADO" ? "destructive" : "outline"}>
                {STATUS_LABEL[myAttendance?.status ?? "PENDENTE"]}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => myAttendanceMutation.mutate("CONFIRMADO")} variant={myAttendance?.status === "CONFIRMADO" ? "default" : "outline"}>
                Vou
              </Button>
              <Button onClick={() => myAttendanceMutation.mutate("RECUSADO")} variant={myAttendance?.status === "RECUSADO" ? "destructive" : "outline"}>
                Não vou
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Presenças ({match.attendances.filter((a) => a.status === "CONFIRMADO").length} confirmados)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {match.attendances.map((attendance) => (
            <div key={attendance.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
              <div className="flex items-center gap-3">
                <PlayerAvatar name={attendance.player.name} photoUrl={attendance.player.photoUrl} className="h-8 w-8" />
                <div>
                  <p className="text-sm font-medium">{attendance.player.nickname}</p>
                  <Badge
                    variant={attendance.status === "CONFIRMADO" ? "success" : attendance.status === "RECUSADO" ? "destructive" : "outline"}
                    className="mt-0.5"
                  >
                    {STATUS_LABEL[attendance.status]}
                  </Badge>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Select
                    value={attendance.status}
                    onValueChange={(status) => overrideMutation.mutate({ playerId: attendance.playerId, status })}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="CONFIRMADO">Vou</SelectItem>
                      <SelectItem value="RECUSADO">Não vou</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant={attendance.attended ? "default" : "outline"}
                    title="Marcar comparecimento real"
                    onClick={() => checkinMutation.mutate({ playerId: attendance.playerId, attended: !attendance.attended })}
                  >
                    {attendance.attended ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Convidados no jogo</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setGuestDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {match.guests.length === 0 && <p className="text-sm text-muted-foreground">Nenhum convidado neste jogo.</p>}
          {match.guests.map((mg) => (
            <div key={mg.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
              <div>
                <p className="text-sm font-medium">{mg.guest.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(mg.fee)}</p>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <Button
                      size="sm"
                      variant={mg.paid ? "default" : "outline"}
                      onClick={() => guestPaidMutation.mutate({ guestId: mg.guestId, paid: !mg.paid })}
                    >
                      <Check className="h-4 w-4" /> {mg.paid ? "Pago" : "Marcar pago"}
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeGuestMutation.mutate(mg.guestId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Badge variant={mg.paid ? "success" : "outline"}>{mg.paid ? "Pago" : "Em aberto"}</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar convidado ao jogo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um convidado" />
              </SelectTrigger>
              <SelectContent>
                {availableGuests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.name} ({guest.defaultFee != null ? formatCurrency(guest.defaultFee) : "R$15,00 padrão"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button disabled={!selectedGuestId || addGuestMutation.isPending} onClick={() => addGuestMutation.mutate(selectedGuestId)}>
                Adicionar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
