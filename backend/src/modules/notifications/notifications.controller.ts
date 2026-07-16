import { Request, Response } from "express";
import * as notificationsService from "./notifications.service";
import { ApiError } from "../../utils/ApiError";

export async function listNotificationsHandler(req: Request, res: Response) {
  if (!req.auth?.playerId) {
    throw new ApiError(403, "Apenas jogadores com login possuem notificações");
  }
  res.json(await notificationsService.listNotifications(req.auth.playerId));
}

export async function markAsReadHandler(req: Request, res: Response) {
  if (!req.auth?.playerId) {
    throw new ApiError(403, "Apenas jogadores com login possuem notificações");
  }
  res.json(await notificationsService.markAsRead(req.params.id, req.auth.playerId));
}
