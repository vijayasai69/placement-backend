"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const notification_agent_js_1 = require("../features/ai-agents/notification-agent.js");
const prisma = new client_1.PrismaClient();
async function testNotification() {
    const targetEmail = 'vijayasai6.9.6@gmail.com';
    console.log(`Looking up user in database: ${targetEmail}...`);
    // Try to find the user's real name from the database
    const user = await prisma.user.findUnique({
        where: { email: targetEmail }
    });
    const userName = user?.name || 'Awesome Candidate';
    console.log(`Sending test job match alert for ${userName}...`);
    const success = await notification_agent_js_1.notificationAgent.sendJobMatchAlert({
        email: targetEmail,
        userName: userName,
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        matchScore: 95,
        missingSkills: ['Kubernetes', 'GraphQL'],
        applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        applyLink: 'http://localhost:5173' // Redirects to your website
    });
    if (success) {
        console.log('✅ Notification sent successfully! Check your email inbox or SMTP logger.');
    }
    else {
        console.log('❌ Failed to send notification.');
    }
}
testNotification()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
});
