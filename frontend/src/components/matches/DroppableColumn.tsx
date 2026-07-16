import { useDroppable } from "@dnd-kit/core";
import { DraggablePlayerChip } from "./DraggablePlayerChip";
import { TeamMember } from "./teamMember";
import { cn } from "@/lib/utils";

export function DroppableColumn({
  id,
  title,
  members,
  color,
  disabled,
}: {
  id: string;
  title: string;
  members: TeamMember[];
  color?: string;
  disabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  const withOverall = members.filter((m) => m.kind === "PLAYER");
  const totalOverall = withOverall.reduce((sum, m) => sum + (m.overall ?? 0), 0);
  const avgOverall = withOverall.length > 0 ? Math.round(totalOverall / withOverall.length) : 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[280px] flex-col gap-2 rounded-xl border-2 border-dashed border-border p-3 transition-colors",
        isOver && "border-primary bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {color && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />}
          <p className="text-sm font-bold">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {members.length} jog. · média {avgOverall}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <DraggablePlayerChip key={member.dndId} member={member} disabled={disabled} />
        ))}
        {members.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">Arraste jogadores aqui</p>}
      </div>
    </div>
  );
}
