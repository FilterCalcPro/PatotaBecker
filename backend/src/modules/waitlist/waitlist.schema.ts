import { z } from "zod";

export const createWaitlistSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  whatsapp: z.string().min(8, "WhatsApp inválido"),
  city: z.string().min(2, "Cidade obrigatória"),
});

export const approveWaitlistSchema = z.object({
  type: z.enum(["LINHA", "GOLEIRO"]),
});

export type CreateWaitlistInput = z.infer<typeof createWaitlistSchema>;
export type ApproveWaitlistInput = z.infer<typeof approveWaitlistSchema>;
