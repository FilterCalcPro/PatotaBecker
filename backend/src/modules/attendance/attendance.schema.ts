import { z } from "zod";

export const setAttendanceSchema = z.object({
  status: z.enum(["CONFIRMADO", "RECUSADO", "PENDENTE"]),
});

export type SetAttendanceInput = z.infer<typeof setAttendanceSchema>;
