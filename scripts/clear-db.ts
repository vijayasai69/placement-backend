import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Wiping database cleanly...");

  await prisma.recommendation.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.resume.deleteMany();
  
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.verification.deleteMany();

  console.log("Database completely wiped!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
