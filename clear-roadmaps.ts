import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.candidateProfile.updateMany({
    data: {
      roadmap: null as any
    }
  });
  console.log("All roadmaps cleared to force regeneration.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
