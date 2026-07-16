import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Plus, TrendingDown, TrendingUp, Trash2, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionFormDialog } from "@/components/finance/TransactionFormDialog";
import * as financeService from "@/services/finance.service";
import { getErrorMessage } from "@/services/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentMethod } from "@/types";

export default function CashFlow() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("PIX");

  const { data: summary } = useQuery({ queryKey: ["finance-summary"], queryFn: financeService.getSummary });
  const { data: transactions, isLoading: loadingTx } = useQuery({ queryKey: ["transactions"], queryFn: financeService.listTransactions });
  const { data: fees, isLoading: loadingFees } = useQuery({ queryKey: ["monthly-fees"], queryFn: () => financeService.listMonthlyFees() });

  const deleteMutation = useMutation({
    mutationFn: financeService.deleteTransaction,
    onSuccess: () => {
      toast.success("Lançamento removido.");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const payMutation = useMutation({
    mutationFn: () => financeService.payMonthlyFee(payingFeeId!, method),
    onSuccess: () => {
      toast.success("Mensalidade paga!");
      queryClient.invalidateQueries({ queryKey: ["monthly-fees"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
      setPayingFeeId(null);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Entradas" value={formatCurrency(summary?.totalIncome ?? 0)} icon={TrendingUp} tone="success" />
        <StatCard label="Saídas" value={formatCurrency(summary?.totalExpense ?? 0)} icon={TrendingDown} tone="destructive" />
        <StatCard label="Saldo" value={formatCurrency(summary?.balance ?? 0)} icon={Wallet} />
      </div>

      <Tabs defaultValue="movimentacoes">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
          </TabsList>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Novo Lançamento
          </Button>
        </div>

        <TabsContent value="movimentacoes">
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              {loadingTx ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)
              ) : transactions?.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
              ) : (
                transactions?.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      {tx.type === "ENTRADA" ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category} · {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={tx.type === "ENTRADA" ? "font-semibold text-success" : "font-semibold text-destructive"}>
                        {tx.type === "ENTRADA" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Remover este lançamento?")) deleteMutation.mutate(tx.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mensalidades">
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              {loadingFees ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)
              ) : fees?.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma mensalidade gerada ainda.</p>
              ) : (
                fees?.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{fee.player?.nickname}</p>
                      <p className="text-xs text-muted-foreground">
                        {fee.referenceMonth} · {formatCurrency(fee.amount)}
                      </p>
                    </div>
                    {fee.status === "PAGO" ? (
                      <Badge variant="success">Pago {fee.method ? `(${fee.method})` : ""}</Badge>
                    ) : (
                      <Button size="sm" onClick={() => setPayingFeeId(fee.id)}>
                        <CheckCircle2 className="h-4 w-4" /> Marcar como paga
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!payingFeeId} onOpenChange={(v) => !v && setPayingFeeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forma de pagamento</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CARTAO">Cartão recorrente</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button disabled={payMutation.isPending} onClick={() => payMutation.mutate()}>
                Confirmar pagamento
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
