import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";
import { ApiError } from "../../utils/ApiError";

export async function getAdminDashboardHandler(_req: Request, res: Response) {
  res.json(await dashboardService.getAdminDashboard());
}

export async function getPlayerDashboardHandler(req: Request, res: Response) {
  if (!req.auth) throw new ApiError(401, "Não autenticado");
  if (req.auth.role === "JOGADOR" && req.auth.playerId !== req.params.id) {
    throw new ApiError(403, "Você só pode ver seu próprio dashboard");
  }
  res.json(await dashboardService.getPlayerDashboard(req.params.id));
}
