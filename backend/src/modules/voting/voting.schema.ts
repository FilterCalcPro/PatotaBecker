import { z } from "zod";

export const castVoteSchema = z
  .object({
    mvpFirst: z.string().min(1),
    mvpSecond: z.string().min(1),
    mvpThird: z.string().min(1),
    topScorer: z.string().min(1),
    bestGoalkeeper: z.string().min(1),
  })
  .refine((data) => new Set([data.mvpFirst, data.mvpSecond, data.mvpThird]).size === 3, {
    message: "As três escolhas de MVP devem ser jogadores diferentes",
  });

export type CastVoteInput = z.infer<typeof castVoteSchema>;
