import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Goal, HandHeart, Shield, Trophy, Wallet } from "lucide-react";
import * as tvService from "@/services/tv.service";
import { formatCurrency, formatDateLong, initials } from "@/lib/utils";

export default function TVPanel() {
  const { data } = useQuery({ queryKey: ["tv-panel"], queryFn: tvService.getTvPanel, refetchInterval: 15_000 });

  if (!data) {
    return <div className="flex min-h-screen items-center justify-center bg-[#050810] text-white">Carregando painel...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050810] p-8 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-900">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <p className="text-2xl font-black leading-tight">PATOTA BARBEARIA</p>
            <p className="text-2xl font-black leading-tight text-emerald-400">BECKER</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3">
          <Wallet className="h-6 w-6 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">Saldo do caixa</p>
            <p className="text-xl font-bold">{formatCurrency(data.balance)}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/60 to-transparent p-6">
        <div className="flex items-center gap-3 text-emerald-400">
          <CalendarDays className="h-6 w-6" />
          <p className="text-sm font-bold uppercase tracking-widest">Próximo jogo</p>
        </div>
        {data.nextMatch ? (
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-3xl font-black capitalize">{formatDateLong(data.nextMatch.date)}</p>
              <p className="text-lg text-white/70">
                {data.nextMatch.time} · {data.nextMatch.location} · {data.nextMatch.format === "SEIS" ? "6x6" : "7x7"}
              </p>
            </div>
            <p className="text-4xl font-black text-emerald-400">{data.nextMatch.confirmed} confirmados</p>
          </div>
        ) : (
          <p className="mt-2 text-xl text-white/60">Nenhum jogo agendado</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Panel title="Artilheiros" icon={Goal}>
          {data.topScorers.map(
            (s, i) =>
              s.player && (
                <Row key={s.player.id} rank={i + 1} name={s.player.nickname} photo={s.player.photoUrl} value={s.goals} />
              )
          )}
        </Panel>

        <Panel title="Assistências" icon={HandHeart}>
          {data.topAssists.map(
            (s, i) =>
              s.player && (
                <Row key={s.player.id} rank={i + 1} name={s.player.nickname} photo={s.player.photoUrl} value={s.assists} />
              )
          )}
        </Panel>

        <Panel title="Maior Overall" icon={Trophy}>
          {data.topOverall.map((p, i) => (
            <Row key={p.id} rank={i + 1} name={p.nickname} photo={p.photoUrl} value={p.overall} />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Trophy; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-2 text-emerald-400">
        <Icon className="h-5 w-5" />
        <p className="text-sm font-bold uppercase tracking-widest">{title}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({ rank, name, photo, value }: { rank: number; name: string; photo?: string | null; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 text-sm font-bold text-white/40">{rank}</span>
      {photo ? (
        <img src={photo} alt={name} className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{initials(name)}</div>
      )}
      <span className="flex-1 truncate font-semibold">{name}</span>
      <span className="text-xl font-black text-emerald-400">{value}</span>
    </div>
  );
}
