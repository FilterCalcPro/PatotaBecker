-- CreateTable: Patota
CREATE TABLE "Patota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Patota_slug_key" ON "Patota"("slug");

-- Inserir Patota Becker com ID fixo para associar dados existentes
INSERT INTO "Patota" ("id", "name", "slug") VALUES ('patota-becker-001', 'Patota Becker', 'becker');

-- AddColumn patotaId a todas as tabelas relevantes com DEFAULT para dados existentes
ALTER TABLE "User" ADD COLUMN "patotaId" TEXT NOT NULL DEFAULT 'patota-becker-001' REFERENCES "Patota"("id");
ALTER TABLE "Player" ADD COLUMN "patotaId" TEXT NOT NULL DEFAULT 'patota-becker-001' REFERENCES "Patota"("id");
ALTER TABLE "Guest" ADD COLUMN "patotaId" TEXT NOT NULL DEFAULT 'patota-becker-001' REFERENCES "Patota"("id");
ALTER TABLE "Match" ADD COLUMN "patotaId" TEXT NOT NULL DEFAULT 'patota-becker-001' REFERENCES "Patota"("id");
ALTER TABLE "Transaction" ADD COLUMN "patotaId" TEXT NOT NULL DEFAULT 'patota-becker-001' REFERENCES "Patota"("id");
ALTER TABLE "WaitlistEntry" ADD COLUMN "patotaId" TEXT NOT NULL DEFAULT 'patota-becker-001' REFERENCES "Patota"("id");
