import { sendEmail } from "../../providers/email.provider.js";
import { logger } from "../../utils/logger.js";

interface JobMatchAlertData {
  email: string;
  userName: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  missingSkills: string[];
  applicationDeadline: Date;
  applyLink: string;
}

export class NotificationAgent {
  async sendJobMatchAlert(data: JobMatchAlertData): Promise<boolean> {
    logger.info(`NotificationAgent preparing email alert for user: ${data.email} regarding job: ${data.jobTitle}`);

    const formattedDeadline = data.applicationDeadline.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject = `🔥 Match Alert: ${data.matchScore}% Fit for ${data.jobTitle} at ${data.company}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Hello ${data.userName}!</h2>
        <p style="font-size: 16px; color: #334155; line-height: 1.5;">
          We found a new job opening that perfectly matches your profile!
        </p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">${data.jobTitle}</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>Company:</strong> ${data.company}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>Match Percentage:</strong> <span style="color: #10b981; font-weight: bold;">${data.matchScore}%</span></p>
          <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>Application Deadline:</strong> ${formattedDeadline}</p>
        </div>

        ${data.missingSkills.length > 0 ? `
          <div style="margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #b91c1c;">Missing Skills to Bridge:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #475569;">
              ${data.missingSkills.map(skill => `<li style="font-size: 14px; margin-bottom: 4px;">${skill}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <div style="margin: 25px 0 10px 0; text-align: center;">
          <a href="${data.applyLink}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Apply Now</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automated notification from the AI Placement Recommendation System.
        </p>
      </div>
    `;

    return sendEmail({
      to: data.email,
      subject,
      html: htmlContent,
    });
  }

  async sendDeadlineReminder(data: {
    email: string;
    userName: string;
    jobTitle: string;
    company: string;
    applicationDeadline: Date;
    applyLink: string;
  }): Promise<boolean> {
    logger.info(`NotificationAgent preparing deadline reminder for user: ${data.email}`);

    const formattedDeadline = data.applicationDeadline.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject = `⚠️ Deadline Approaching: Apply to ${data.jobTitle} at ${data.company}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fecaca; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #991b1b; margin-top: 0;">Deadline Reminder!</h2>
        <p style="font-size: 16px; color: #334155; line-height: 1.5;">
          The application deadline for <strong>${data.jobTitle}</strong> at <strong>${data.company}</strong> is approaching soon!
        </p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>Apply Before:</strong> <span style="color: #b91c1c; font-weight: bold;">${formattedDeadline}</span></p>
        </div>

        <div style="margin: 25px 0 10px 0; text-align: center;">
          <a href="${data.applyLink}" target="_blank" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Apply Before It Closes</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automated notification from the AI Placement Recommendation System.
        </p>
      </div>
    `;

    return sendEmail({
      to: data.email,
      subject,
      html: htmlContent,
    });
  }
}

export const notificationAgent = new NotificationAgent();
export default notificationAgent;
