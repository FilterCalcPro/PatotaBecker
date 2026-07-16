import { Request, Response } from "express";
import * as achievementsService from "./achievements.service";

export async function listAchievementsHandler(_req: Request, res: Response) {
  res.json(await achievementsService.listAchievements());
}
