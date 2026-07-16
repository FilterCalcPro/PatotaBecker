import { cn } from "@/lib/utils";

function toneFor(overall: number) {
  if (overall >= 80) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (overall >= 65) return "bg-primary/15 text-primary border-primary/30";
  if (overall >= 50) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-rose-500/15 text-rose-400 border-rose-500/30";
}

export function OverallBadge({ overall, size = "md" }: { overall: number; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border font-extrabold tabular-nums",
        toneFor(overall),
        size === "sm" && "h-7 w-7 text-xs",
        size === "md" && "h-10 w-10 text-sm",
        size === "lg" && "h-16 w-16 text-2xl"
      )}
    >
      {overall}
    </div>
  );
}
