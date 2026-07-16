import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../config/jwt";
import { ApiError } from "../utils/ApiError";

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Token de autenticação ausente");
  }

  const token = header.substring("Bearer ".length);

  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    throw new ApiError(401, "Token de autenticação inválido ou expirado");
  }
}
