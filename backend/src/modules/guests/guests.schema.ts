import { z } from "zod";

export const createGuestSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  whatsapp: z.string().min(8, "WhatsApp inválido").optional().or(z.literal("")),
  defaultFee: z.number().positive().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
