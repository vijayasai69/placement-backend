import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.candidateProfile.updateMany({
    data: {
      // @ts-ignore
      marketIntelligence: null
    }
  });
  console.log("Cleared market intelligence data.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
