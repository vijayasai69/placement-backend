import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = "vijayasai6.9.6@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("User not found");
    return;
  }
  console.log("User:", user);
  const accounts = await prisma.account.findMany({ where: { userId: user.id } });
  console.log("Accounts:");
  console.log(accounts.map(a => ({ id: a.id, providerId: a.providerId, hasPassword: !!a.password })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
