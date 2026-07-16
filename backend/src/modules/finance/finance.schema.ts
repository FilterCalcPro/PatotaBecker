import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["ENTRADA", "SAIDA"]),
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const payFeeSchema = z.object({
  method: z.enum(["PIX", "CARTAO"]),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type PayFeeInput = z.infer<typeof payFeeSchema>;
