import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

export type NotificationType = "ATTENDANCE" | "MONTHLY_FEE" | "VOTING";

export async function createNotification(playerId: string, type: NotificationType, title: string, message: string) {
  return prisma.notification.create({ data: { playerId, type, title, message } });
}

export async function listNotifications(playerId: string) {
  return prisma.notification.findMany({ where: { playerId }, orderBy: { createdAt: "desc" } });
}

export async function markAsRead(id: string, playerId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.playerId !== playerId) {
    throw new ApiError(404, "Notificação não encontrada");
  }
  return prisma.notification.update({ where: { id }, data: { read: true } });
}
