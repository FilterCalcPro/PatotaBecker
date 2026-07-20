import { Request, Response } from "express";
import * as teamsService from "./teams.service";

export async function getTeamsHandler(req: Request, res: Response) {
  res.json(await teamsService.getTeams(req.params.id));
}

export async function saveTeamsHandler(req: Request, res: Response) {
  res.json(await teamsService.saveTeams(req.params.id, req.body));
}

export async function autoBalanceHandler(req: Request, res: Response) {
  res.json(await teamsService.autoBalanceTeams(req.params.id));
}

export async function clearTeamsHandler(req: Request, res: Response) {
  await teamsService.clearTeams(req.params.id);
  res.status(204).send();
}
