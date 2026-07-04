import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER && env.SMTP_PASS ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  } : undefined,
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}
