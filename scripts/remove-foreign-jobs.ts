import { prisma } from "./src/config/prisma.js";
import { isEnglish } from "./src/utils/language.js";

async function main() {
  console.log("Fetching all jobs...");
  const jobs = await prisma.job.findMany();
  console.log(`Found ${jobs.length} jobs in database.`);

  const idsToDelete: string[] = [];
  for (const job of jobs) {
    if (!isEnglish(job.title + " " + job.description)) {
      idsToDelete.push(job.id);
    }
  }

  if (idsToDelete.length > 0) {
    console.log(`Found ${idsToDelete.length} non-English jobs. Deleting...`);
    const result = await prisma.job.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    });
    console.log(`Successfully deleted ${result.count} non-English jobs.`);
  } else {
    console.log("No non-English jobs found in the database.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
