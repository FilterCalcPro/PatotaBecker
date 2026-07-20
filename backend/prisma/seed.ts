import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding banco de dados...");

  // Cria ou atualiza as patotas
  await prisma.patota.upsert({
    where: { id: "patota-becker-001" },
    update: {},
    create: {
      id: "patota-becker-001",
      name: "Patota Becker",
    },
  });

  await prisma.patota.upsert({
    where: { id: "patota-segunda-001" },
    update: {},
    create: {
      id: "patota-segunda-001",
      name: "Patota de Segunda",
    },
  });

  const adminHash = await bcrypt.hash("admin123", 10);

  // Admin da Patota Becker
  await prisma.user.upsert({
    where: { email: "admin@patotabecker.com" },
    update: { patotaId: "patota-becker-001" },
    create: {
      email: "admin@patotabecker.com",
      passwordHash: adminHash,
      role: "ADMIN",
      patotaId: "patota-becker-001",
    },
  });

  // Admin da Patota de Segunda
  await prisma.user.upsert({
    where: { email: "admin@patotasegunda.com" },
    update: { patotaId: "patota-segunda-001" },
    create: {
      email: "admin@patotasegunda.com",
      passwordHash: adminHash,
      role: "ADMIN",
      patotaId: "patota-segunda-001",
    },
  });

  // Garante que todos os usuários existentes da Patota Becker tenham patotaId
  await prisma.user.updateMany({
    where: { patotaId: null },
    data: { patotaId: "patota-becker-001" },
  });

  console.log("Seed concluído!");
  console.log("Admin Patota Becker: admin@patotabecker.com / admin123");
  console.log("Admin Patota de Segunda: admin@patotasegunda.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
