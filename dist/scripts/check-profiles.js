"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const resumes = await prisma.resume.findMany({
        orderBy: { uploadedAt: 'desc' },
        take: 2
    });
    for (const resume of resumes) {
        console.log(`Resume ID: ${resume.id}, Uploaded At: ${resume.uploadedAt}, Filename: ${resume.filePath}`);
        console.log(`Raw Text Preview (first 500 chars):`, resume.rawText.substring(0, 500));
        console.log(`--------------------------------------------------`);
    }
    const profiles = await prisma.candidateProfile.findMany({
        take: 2
    });
    console.log(`\nFound ${profiles.length} profiles.`);
    for (const p of profiles) {
        console.log(`Profile ID: ${p.id}, User ID: ${p.userId}, Roadmap: ${p.roadmap ? 'Exists' : 'Null'}`);
    }
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
