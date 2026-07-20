import { z } from "zod";

export const createPlayerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  nickname: z.string().min(1, "Apelido obrigatório"),
  whatsapp: z.string().min(8, "WhatsApp inválido"),
  photoUrl: z.string().url().optional().nullable(),
  type: z.enum(["LINHA", "GOLEIRO"]),
  createLogin: z.boolean().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export const updatePlayerSchema = z.object({
  name: z.string().min(2).optional(),
  nickname: z.string().min(1).optional(),
  whatsapp: z.string().min(8).optional(),
  photoUrl: z.string().url().optional().nullable(),
  type: z.enum(["LINHA", "GOLEIRO"]).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["ATIVO", "INATIVO"]),
});

export const createLoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type CreateLoginInput = z.infer<typeof createLoginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
