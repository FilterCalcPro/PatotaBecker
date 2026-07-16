import { Request, Response } from "express";
import * as attendanceService from "./attendance.service";
import { ApiError } from "../../utils/ApiError";

export async function setOwnAttendanceHandler(req: Request, res: Response) {
  if (!req.auth?.playerId) {
    throw new ApiError(403, "Apenas jogadores com login podem confirmar presença");
  }
  if (req.body.status !== "CONFIRMADO" && req.body.status !== "RECUSADO") {
    throw new ApiError(400, "Status inválido para confirmação de presença");
  }
  const attendance = await attendanceService.setOwnAttendance(req.params.id, req.auth.playerId, req.body.status);
  res.json(attendance);
}

export async function overrideAttendanceHandler(req: Request, res: Response) {
  const attendance = await attendanceService.overrideAttendance(req.params.id, req.params.playerId, req.body.status);
  res.json(attendance);
}

export async function checkinAttendanceHandler(req: Request, res: Response) {
  const attended = req.body.attended !== false;
  const attendance = await attendanceService.checkinAttendance(req.params.id, req.params.playerId, attended);
  res.json(attendance);
}
