import { PrismaClient, PlayerType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { code: "50_GOALS", name: "Matador", description: "Marcou 50 gols pela patota", icon: "target" },
  { code: "50_ASSISTS", name: "Garçom", description: "Deu 50 assistências pela patota", icon: "hand-heart" },
  { code: "20_PRESENCES", name: "Presença Garantida", description: "Compareceu a 20 jogos", icon: "calendar-check" },
  { code: "10_MVP", name: "Craque da Galera", description: "Foi eleito MVP 10 vezes", icon: "trophy" },
  { code: "10_TOP_SCORER", name: "Artilheiro Nato", description: "Foi eleito melhor marcador 10 vezes", icon: "crosshair" },
  { code: "10_BEST_GK", name: "Paredão", description: "Foi eleito melhor goleiro 10 vezes", icon: "shield" },
  { code: "VETERAN", name: "Veterano", description: "Mais de 1 ano de patota", icon: "medal" },
  { code: "PUNCTUAL_PAYER", name: "Pagador Pontual", description: "6 meses seguidos com mensalidade em dia", icon: "credit-card" },
];

const SAMPLE_PLAYERS: Array<{
  name: string;
  nickname: string;
  whatsapp: string;
  type: PlayerType;
  overall: number;
  withLogin?: boolean;
}> = [
  { name: "Carlos Eduardo Souza", nickname: "Cadu", whatsapp: "5511990000001", type: "LINHA", overall: 78, withLogin: true },
  { name: "Bruno Alves Lima", nickname: "Bruninho", whatsapp: "5511990000002", type: "LINHA", overall: 72 },
  { name: "Diego Ferreira", nickname: "Digão", whatsapp: "5511990000003", type: "LINHA", overall: 65 },
  { name: "Felipe Martins", nickname: "Felipão", whatsapp: "5511990000004", type: "LINHA", overall: 80 },
  { name: "Gustavo Rocha", nickname: "Guga", whatsapp: "5511990000005", type: "LINHA", overall: 60 },
  { name: "Henrique Costa", nickname: "Rique", whatsapp: "5511990000006", type: "LINHA", overall: 70 },
  { name: "Igor Nascimento", nickname: "Igão", whatsapp: "5511990000007", type: "LINHA", overall: 55 },
  { name: "João Pedro Almeida", nickname: "JP", whatsapp: "5511990000008", type: "LINHA", overall: 68 },
  { name: "Lucas Barbosa", nickname: "Lucão", whatsapp: "5511990000009", type: "LINHA", overall: 74 },
  { name: "Marcelo Dias", nickname: "Marcelinho", whatsapp: "5511990000010", type: "LINHA", overall: 62 },
  { name: "Rafael Teixeira", nickname: "Rafa", whatsapp: "5511990000011", type: "LINHA", overall: 58 },
  { name: "Thiago Ramos", nickname: "Thiaguinho", whatsapp: "5511990000012", type: "LINHA", overall: 66 },
  { name: "Vinícius Pereira", nickname: "Vini", whatsapp: "5511990000013", type: "GOLEIRO", overall: 75 },
  { name: "William Santos", nickname: "Willão", whatsapp: "5511990000014", type: "GOLEIRO", overall: 63 },
];

async function main() {
  console.log("Seeding banco de dados...");

  // Conquistas globais (compartilhadas por todas as patotas)
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: achievement,
    });
  }

  // ─── Patota Becker ───────────────────────────────────────────────────────────
  const patotaBecker = await prisma.patota.upsert({
    where: { slug: "becker" },
    update: {},
    create: { id: "patota-becker-001", name: "Patota Becker", slug: "becker" },
  });
  console.log(`Patota criada/encontrada: ${patotaBecker.name} (id: ${patotaBecker.id})`);

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@patotabecker.com" },
    update: {},
    create: {
      email: "admin@patotabecker.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      patotaId: patotaBecker.id,
    },
  });

  const playerPasswordHash = await bcrypt.hash("jogador123", 10);

  for (const p of SAMPLE_PLAYERS) {
    // Evita duplicatas em re-seeds
    const existing = await prisma.player.findFirst({ where: { whatsapp: p.whatsapp, patotaId: patotaBecker.id } });
    if (existing) continue;

    const overallVariance = Math.floor(p.overall * 0.6);
    const player = await prisma.player.create({
      data: {
        name: p.name,
        nickname: p.nickname,
        whatsapp: p.whatsapp,
        type: p.type,
        status: "ATIVO",
        overall: p.overall,
        attack: p.type === "GOLEIRO" ? 40 : overallVariance,
        passing: overallVariance,
        defense: p.type === "GOLEIRO" ? p.overall : overallVariance,
        participation: overallVariance,
        presenceAttr: overallVariance,
        physical: overallVariance,
        patotaId: patotaBecker.id,
      },
    });

    if (p.withLogin) {
      const email = `${p.nickname.toLowerCase().replace(/[^a-z0-9]/g, "")}@patotabecker.com`;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email,
            passwordHash: playerPasswordHash,
            role: "JOGADOR",
            playerId: player.id,
            patotaId: patotaBecker.id,
          },
        });
      }
    }
  }

  // ─── Patota de Segunda ────────────────────────────────────────────────────────
  const patotaSegunda = await prisma.patota.upsert({
    where: { slug: "segunda" },
    update: {},
    create: { name: "Patota de Segunda", slug: "segunda" },
  });
  console.log(`Patota criada/encontrada: ${patotaSegunda.name} (id: ${patotaSegunda.id})`);

  const segundaAdminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@patotasegunda.com" },
    update: {},
    create: {
      email: "admin@patotasegunda.com",
      passwordHash: segundaAdminHash,
      role: "ADMIN",
      patotaId: patotaSegunda.id,
    },
  });

  console.log("Seed concluído.");
  console.log("─── Patota Becker ──────────────────────────────");
  console.log("Login admin:   admin@patotabecker.com / admin123");
  console.log("Login jogador: cadu@patotabecker.com / jogador123");
  console.log("─── Patota de Segunda ──────────────────────────");
  console.log("Login admin:   admin@patotasegunda.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
