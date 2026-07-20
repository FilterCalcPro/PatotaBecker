import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding banco de dados...");

  await prisma.$executeRawUnsafe(
    `INSERT OR IGNORE INTO "Patota" (id, name, createdAt, updatedAt)
     VALUES ('patota-becker-001', 'Patota Becker', datetime('now'), datetime('now'))`
  );
  await prisma.$executeRawUnsafe(
    `INSERT OR IGNORE INTO "Patota" (id, name, createdAt, updatedAt)
     VALUES ('patota-segunda-001', 'Patota de Segunda', datetime('now'), datetime('now'))`
  );

  const hash = await bcrypt.hash("admin123", 10);
  const now = new Date().toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT OR IGNORE INTO "User" (id, email, passwordHash, role, patotaId, createdAt, updatedAt)
     VALUES (lower(hex(randomblob(16))), 'admin@patotabecker.com', ?, 'ADMIN', 'patota-becker-001', ?, ?)`,
    hash, now, now
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "User" SET patotaId = 'patota-becker-001' WHERE email = 'admin@patotabecker.com'`
  );

  await prisma.$executeRawUnsafe(
    `INSERT OR IGNORE INTO "User" (id, email, passwordHash, role, patotaId, createdAt, updatedAt)
     VALUES (lower(hex(randomblob(16))), 'admin@patotasegunda.com', ?, 'ADMIN', 'patota-segunda-001', ?, ?)`,
    hash, now, now
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "User" SET patotaId = 'patota-segunda-001' WHERE email = 'admin@patotasegunda.com'`
  );

  await prisma.$executeRawUnsafe(
    `UPDATE "User" SET patotaId = 'patota-becker-001' WHERE patotaId IS NULL OR patotaId = ''`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "Player" SET patotaId = 'patota-becker-001' WHERE patotaId IS NULL OR patotaId = ''`
  );

  console.log("Seed concluído!");
  console.log("admin@patotabecker.com / admin123");
  console.log("admin@patotasegunda.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
