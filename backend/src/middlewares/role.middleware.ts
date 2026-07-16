import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export function requireRole(...roles: Array<"ADMIN" | "JOGADOR">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      throw new ApiError(403, "Você não tem permissão para acessar este recurso");
    }
    next();
  };
}
