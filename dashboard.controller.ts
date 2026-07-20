import { z } from "zod";

export const createMatchSchema = z.object({
  date: z.string().datetime().or(z.string().min(10)),
  time: z.string().min(4),
  location: z.string().min(2),
  courtCost: z.number().nonnegative(),
  format: z.enum(["SEIS", "SETE"]),
});

export const updateMatchSchema = createMatchSchema.partial();

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
