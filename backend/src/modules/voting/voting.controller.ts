import { Request, Response } from "express";
import * as votingService from "./voting.service";
import { ApiError } from "../../utils/ApiError";

export async function castVoteHandler(req: Request, res: Response) {
  if (!req.auth?.playerId) {
    throw new ApiError(403, "Apenas jogadores com login podem votar");
  }
  res.status(201).json(await votingService.castVote(req.params.id, req.auth.playerId, req.body));
}

export async function getVoteResultsHandler(req: Request, res: Response) {
  res.json(await votingService.getVoteResults(req.params.id));
}

export async function getMyVoteHandler(req: Request, res: Response) {
  if (!req.auth?.playerId) {
    throw new ApiError(403, "Apenas jogadores com login possuem votos");
  }
  res.json(await votingService.getMyVote(req.params.id, req.auth.playerId));
}
