import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateGuestInput, UpdateGuestInput } from "./guests.schema";

export async function listGuests() {
  return prisma.guest.findMany({ orderBy: { name: "asc" } });
}

export async function getGuestById(id: string) {
  const guest = await prisma.guest.findUnique({
    where: { id },
    include: { matches: { include: { match: true }, orderBy: { match: { date: "desc" } } } },
  });
  if (!guest) {
    throw new ApiError(404, "Convidado não encontrado");
  }
  return guest;
}

export async function createGuest(input: CreateGuestInput) {
  return prisma.guest.create({
    data: {
      name: input.name,
      whatsapp: input.whatsapp || null,
      defaultFee: input.defaultFee ?? null,
    },
  });
}

export async function updateGuest(id: string, input: UpdateGuestInput) {
  await getGuestById(id);
  return prisma.guest.update({
    where: { id },
    data: {
      ...input,
      whatsapp: input.whatsapp !== undefined ? input.whatsapp || null : undefined,
    },
  });
}

export async function deleteGuest(id: string) {
  await getGuestById(id);
  await prisma.guest.delete({ where: { id } });
}
