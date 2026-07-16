import { Request, Response } from "express";
import * as tvService from "./tv.service";

export async function getTvPanelHandler(_req: Request, res: Response) {
  res.json(await tvService.getTvPanel());
}
