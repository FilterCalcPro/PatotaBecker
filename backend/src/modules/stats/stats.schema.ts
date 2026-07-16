import { z } from "zod";

export const setStatsSchema = z.object({
  stats: z.array(
    z.object({
      playerId: z.string(),
      goals: z.number().int().nonnegative(),
      assists: z.number().int().nonnegative(),
    })
  ),
});

export const setResultSchema = z.object({
  teamAName: z.string().min(1),
  teamAGoals: z.number().int().nonnegative(),
  teamBName: z.string().min(1),
  teamBGoals: z.number().int().nonnegative(),
});

export const incrementStatSchema = z
  .object({
    playerId: z.string().optional(),
    guestId: z.string().optional(),
    field: z.enum(["goals", "assists"]),
    delta: z.union([z.literal(1), z.literal(-1)]),
  })
  .refine((data) => !!data.playerId !== !!data.guestId, {
    message: "Informe playerId ou guestId (não ambos)",
  });

export type SetStatsInput = z.infer<typeof setStatsSchema>;
export type SetResultInput = z.infer<typeof setResultSchema>;
export type IncrementStatInput = z.infer<typeof incrementStatSchema>;
