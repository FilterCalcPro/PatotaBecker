import { Request, Response } from "express";
import * as guestsService from "./guests.service";

export async function listGuestsHandler(_req: Request, res: Response) {
  res.json(await guestsService.listGuests());
}

export async function getGuestHandler(req: Request, res: Response) {
  res.json(await guestsService.getGuestById(req.params.id));
}

export async function createGuestHandler(req: Request, res: Response) {
  res.status(201).json(await guestsService.createGuest(req.body));
}

export async function updateGuestHandler(req: Request, res: Response) {
  res.json(await guestsService.updateGuest(req.params.id, req.body));
}

export async function deleteGuestHandler(req: Request, res: Response) {
  await guestsService.deleteGuest(req.params.id);
  res.status(204).send();
}
