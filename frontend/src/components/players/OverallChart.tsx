import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { OverallHistoryEntry } from "@/types";
import { formatDate } from "@/lib/utils";

export function OverallChart({ history }: { history: OverallHistoryEntry[] }) {
  if (history.length < 2) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Ainda não há histórico suficiente para exibir o gráfico.</p>;
  }

  const data = history.map((entry) => ({ date: formatDate(entry.createdAt), overall: entry.overall }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey="overall" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
