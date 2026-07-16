import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { UserRound } from "lucide-react";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { OverallBadge } from "@/components/shared/OverallBadge";
import { cn } from "@/lib/utils";
import { TeamMember } from "./teamMember";

export function DraggablePlayerChip({ member, disabled }: { member: TeamMember; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: member.dndId,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={cn(
        "flex cursor-grab items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-sm shadow-sm active:cursor-grabbing",
        isDragging && "opacity-40",
        disabled && "cursor-default opacity-70"
      )}
    >
      <PlayerAvatar name={member.name} photoUrl={member.photoUrl} className="h-7 w-7" />
      <span className="flex-1 truncate font-medium">{member.nickname}</span>
      {member.kind === "GUEST" ? (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
          <UserRound className="h-3 w-3" /> Convidado
        </span>
      ) : (
        <>
          {member.type === "GOLEIRO" && <span className="text-[10px] font-bold uppercase text-muted-foreground">GOL</span>}
          <OverallBadge overall={member.overall ?? 0} size="sm" />
        </>
      )}
    </div>
  );
}
