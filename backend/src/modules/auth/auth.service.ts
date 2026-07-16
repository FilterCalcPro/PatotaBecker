import { prisma } from "../../lib/prisma";
import { comparePassword } from "../../utils/password";
import { signToken } from "../../config/jwt";
import { ApiError } from "../../utils/ApiError";
import { LoginInput } from "./auth.schema";

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { player: true },
  });

  if (!user) {
    throw new ApiError(401, "E-mail ou senha incorretos");
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "E-mail ou senha incorretos");
  }

  const token = signToken({ userId: user.id, role: user.role, playerId: user.playerId });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      player: user.player,
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { player: true },
  });

  if (!user) {
    throw new ApiError(404, "Usuário não encontrado");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    player: user.player,
  };
}
