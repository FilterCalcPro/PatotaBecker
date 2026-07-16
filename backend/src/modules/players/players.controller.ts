import { Request, Response } from "express";
import * as playersService from "./players.service";
import { ApiError } from "../../utils/ApiError";

export async function listPlayersHandler(req: Request, res: Response) {
  const status = req.query.status as "ATIVO" | "INATIVO" | undefined;
  const players = await playersService.listPlayers(status);
  res.json(players);
}

export async function getPlayerHandler(req: Request, res: Response) {
  const player = await playersService.getPlayerById(req.params.id);
  res.json(player);
}

export async function createPlayerHandler(req: Request, res: Response) {
  const player = await playersService.createPlayer(req.body);
  res.status(201).json(player);
}

export async function updatePlayerHandler(req: Request, res: Response) {
  if (!req.auth) throw new ApiError(401, "Não autenticado");

  let body = req.body;
  if (req.auth.role === "JOGADOR") {
    if (req.auth.playerId !== req.params.id) {
      throw new ApiError(403, "Você só pode editar seu próprio perfil");
    }
    body = { nickname: req.body.nickname, photoUrl: req.body.photoUrl };
  }

  const player = await playersService.updatePlayer(req.params.id, body);
  res.json(player);
}

export async function createLoginHandler(req: Request, res: Response) {
  const player = await playersService.createLoginForPlayer(req.params.id, req.body.email, req.body.password);
  res.status(201).json(player);
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const player = await playersService.resetPasswordForPlayer(req.params.id, req.body.password);
  res.json(player);
}

export async function updatePlayerStatusHandler(req: Request, res: Response) {
  const player = await playersService.updatePlayerStatus(req.params.id, req.body.status);
  res.json(player);
}

export async function deletePlayerHandler(req: Request, res: Response) {
  await playersService.deletePlayer(req.params.id);
  res.status(204).send();
}

export async function getPlayerStatsHandler(req: Request, res: Response) {
  const stats = await playersService.getPlayerStats(req.params.id);
  res.json(stats);
}

export async function getPlayerOverallHistoryHandler(req: Request, res: Response) {
  const history = await playersService.getPlayerOverallHistory(req.params.id);
  res.json(history);
}

export async function getPlayerAchievementsHandler(req: Request, res: Response) {
  const achievements = await playersService.getPlayerAchievements(req.params.id);
  res.json(achievements);
}
