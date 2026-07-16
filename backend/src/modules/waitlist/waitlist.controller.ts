import { Request, Response } from "express";
import * as waitlistService from "./waitlist.service";

export async function listWaitlistHandler(_req: Request, res: Response) {
  res.json(await waitlistService.listWaitlist());
}

export async function createWaitlistHandler(req: Request, res: Response) {
  res.status(201).json(await waitlistService.createWaitlistEntry(req.body));
}

export async function approveWaitlistHandler(req: Request, res: Response) {
  res.status(201).json(await waitlistService.approveWaitlistEntry(req.params.id, req.body.type));
}

export async function deleteWaitlistHandler(req: Request, res: Response) {
  await waitlistService.deleteWaitlistEntry(req.params.id);
  res.status(204).send();
}
