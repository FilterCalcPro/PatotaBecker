import { Request, Response } from "express";
import * as rankingsService from "./rankings.service";
import { ApiError } from "../../utils/ApiError";

const VALID_TYPES = ["goals", "assists", "mvp", "top-scorer", "best-gk", "presences", "streak", "overall"];

export async function getRankingHandler(req: Request, res: Response) {
  const type = req.params.type;
  if (!VALID_TYPES.includes(type)) {
    throw new ApiError(400, "Tipo de ranking inválido");
  }
  res.json(await rankingsService.getRanking(type as rankingsService.RankingType));
}
