"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
const transporter = nodemailer_1.default.createTransport({
    host: env_js_1.env.SMTP_HOST,
    port: env_js_1.env.SMTP_PORT,
    secure: env_js_1.env.SMTP_PORT === 465,
    auth: env_js_1.env.SMTP_USER && env_js_1.env.SMTP_PASS ? {
        user: env_js_1.env.SMTP_USER,
        pass: env_js_1.env.SMTP_PASS,
    } : undefined,
});
async function sendEmail({ to, subject, html, }) {
    try {
        const info = await transporter.sendMail({
            from: env_js_1.env.SMTP_FROM,
            to,
            subject,
            html,
        });
        logger_js_1.logger.info(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return true;
    }
    catch (error) {
        logger_js_1.logger.error(`Failed to send email to ${to}:`, error);
        return false;
    }
}
