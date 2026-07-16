import { Request, Response } from "express";
import * as matchesService from "./matches.service";

export async function listMatchesHandler(_req: Request, res: Response) {
  res.json(await matchesService.listMatches());
}

export async function getMatchHandler(req: Request, res: Response) {
  res.json(await matchesService.getMatchById(req.params.id));
}

export async function createMatchHandler(req: Request, res: Response) {
  res.status(201).json(await matchesService.createMatch(req.body));
}

export async function updateMatchHandler(req: Request, res: Response) {
  res.json(await matchesService.updateMatch(req.params.id, req.body));
}

export async function deleteMatchHandler(req: Request, res: Response) {
  await matchesService.deleteMatch(req.params.id);
  res.status(204).send();
}

export async function closeMatchHandler(req: Request, res: Response) {
  res.json(await matchesService.closeMatch(req.params.id));
}

export async function startMatchHandler(req: Request, res: Response) {
  res.json(await matchesService.startMatch(req.params.id));
}

export async function recalculateMatchHandler(req: Request, res: Response) {
  res.json(await matchesService.recalculateMatch(req.params.id));
}

export async function addGuestToMatchHandler(req: Request, res: Response) {
  res.status(201).json(await matchesService.addGuestToMatch(req.params.id, req.body.guestId, req.body.fee));
}

export async function removeGuestFromMatchHandler(req: Request, res: Response) {
  await matchesService.removeGuestFromMatch(req.params.id, req.params.guestId);
  res.status(204).send();
}

export async function setGuestPaidHandler(req: Request, res: Response) {
  res.json(await matchesService.setGuestPaid(req.params.id, req.params.guestId, req.body.paid !== false));
}
