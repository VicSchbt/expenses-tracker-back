import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      email: "dev@example.com",
      password: "password123", // ⚠️ plain text for dev only
    },
  });
}

main()
  .then(() => console.log("✅ Dev user created"))
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
