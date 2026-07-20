import { Request, Response } from "express";
import * as statsService from "./stats.service";

export async function setMatchStatsHandler(req: Request, res: Response) {
  res.json(await statsService.setMatchStats(req.params.id, req.body));
}

export async function setMatchResultHandler(req: Request, res: Response) {
  res.json(await statsService.setMatchResult(req.params.id, req.body));
}

export async function incrementStatHandler(req: Request, res: Response) {
  res.json(await statsService.incrementStat(req.params.id, req.body));
}
