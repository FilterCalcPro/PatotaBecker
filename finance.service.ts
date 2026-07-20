import { Request, Response } from "express";
import * as authService from "./auth.service";
import { ApiError } from "../../utils/ApiError";

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json(result);
}

export async function meHandler(req: Request, res: Response) {
  if (!req.auth) {
    throw new ApiError(401, "Não autenticado");
  }
  const result = await authService.getMe(req.auth.userId);
  res.json(result);
}
