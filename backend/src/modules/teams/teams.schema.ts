import { z } from "zod";

export const saveTeamsSchema = z.object({
  teams: z
    .array(
      z.object({
        name: z.string().min(1),
        color: z.string().min(1),
        playerIds: z.array(z.string()).default([]),
        guestIds: z.array(z.string()).default([]),
      })
    )
    .length(2, "É necessário informar exatamente 2 times"),
});

export type SaveTeamsInput = z.infer<typeof saveTeamsSchema>;
