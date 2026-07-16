import { PlayerType } from "@/types";

export interface TeamMember {
  id: string;
  dndId: string;
  kind: "PLAYER" | "GUEST";
  name: string;
  nickname: string;
  photoUrl: string | null;
  type?: PlayerType;
  overall?: number;
}

export function playerDndId(id: string) {
  return `player:${id}`;
}

export function guestDndId(id: string) {
  return `guest:${id}`;
}

export function parseDndId(dndId: string): { kind: "PLAYER" | "GUEST"; id: string } {
  const [kind, id] = dndId.split(":");
  return { kind: kind === "guest" ? "GUEST" : "PLAYER", id };
}
