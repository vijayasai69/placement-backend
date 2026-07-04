"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportPdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const db_1 = require("../services/db");
const resume_1 = require("./resume");
const exportPdf = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const profile = await db_1.prisma.resumeProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!profile) {
            return res.status(400).json({ success: false, message: "Please upload your resume to generate a profile matrix first." });
        }
        const formatted = (0, resume_1.formatProfileResponse)(profile);
        const doc = new pdfkit_1.default({ margin: 50 });
        // Setup HTTP headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=PlaceAI_Profile_${formatted.name.replace(/\s+/g, "_")}.pdf`);
        doc.pipe(res);
        // Header Title
        doc.fontSize(22).fillColor("#1e3a8a").font("Helvetica-Bold").text("PlaceAI - Profile Matrix Report", { align: "center" });
        doc.moveDown(1);
        // Candidate details
        doc.fontSize(16).fillColor("#111827").font("Helvetica-Bold").text(formatted.name);
        doc.fontSize(9).fillColor("#4b5563").font("Helvetica").text(`Email: ${formatted.email}   |   Phone: ${formatted.phone || "N/A"}   |   Location: ${formatted.location || "N/A"}`);
        doc.moveDown(0.8);
        // Draw horizontal separator line
        doc.lineWidth(1).strokeColor("#e5e7eb").moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
        // Executive Summary
        doc.fontSize(12).fillColor("#1e3a8a").font("Helvetica-Bold").text("Executive Summary");
        doc.fontSize(9.5).fillColor("#374151").font("Helvetica").text(formatted.bio || "No summary provided.", { lineGap: 3 });
        doc.moveDown(1.5);
        // Scores
        doc.fontSize(12).fillColor("#1e3a8a").font("Helvetica-Bold").text("ATS Metrics Analysis");
        doc.fontSize(9.5).fillColor("#374151").font("Helvetica")
            .text(`• ATS Match Score: ${formatted.atsScore}%`)
            .text(`• Readability Score: ${formatted.readability}%`)
            .text(`• Keyword Matching Ratio: ${formatted.keywordMatch}%`)
            .text(`• Layout Formatting Score: ${formatted.formatScore}%`, { lineGap: 3 });
        doc.moveDown(1.5);
        // Skills
        doc.fontSize(12).fillColor("#1e3a8a").font("Helvetica-Bold").text("Verified Skills Vector");
        doc.fontSize(9.5).fillColor("#374151").font("Helvetica").text(formatted.skills.join(", "), { lineGap: 2 });
        doc.moveDown(1.5);
        // Experience
        doc.fontSize(12).fillColor("#1e3a8a").font("Helvetica-Bold").text("Professional Experience");
        if (formatted.experience && formatted.experience.length > 0) {
            formatted.experience.forEach((exp) => {
                doc.fontSize(10).fillColor("#111827").font("Helvetica-Bold").text(`${exp.title} — ${exp.company} (${exp.startDate} to ${exp.endDate || "Present"})`);
                if (exp.description) {
                    doc.fontSize(9).fillColor("#4b5563").font("Helvetica").text(exp.description, { lineGap: 2 });
                }
                doc.moveDown(0.6);
            });
        }
        else {
            doc.fontSize(9.5).fillColor("#6b7280").text("No work history listed.");
        }
        doc.moveDown(1);
        // Projects
        doc.fontSize(12).fillColor("#1e3a8a").font("Helvetica-Bold").text("Key Projects");
        if (formatted.projects && formatted.projects.length > 0) {
            formatted.projects.forEach((proj) => {
                doc.fontSize(10).fillColor("#111827").font("Helvetica-Bold").text(`${proj.name} [${proj.technologies.join(", ")}]`);
                if (proj.description) {
                    doc.fontSize(9).fillColor("#4b5563").font("Helvetica").text(proj.description, { lineGap: 2 });
                }
                doc.moveDown(0.6);
            });
        }
        else {
            doc.fontSize(9.5).fillColor("#6b7280").text("No projects listed.");
        }
        doc.moveDown(1);
        // Strengths
        doc.fontSize(12).fillColor("#16a34a").font("Helvetica-Bold").text("Audit Core Strengths");
        formatted.strengths.forEach((str) => {
            doc.fontSize(9).fillColor("#374151").font("Helvetica").text(`• ${str}`, { lineGap: 2 });
        });
        doc.moveDown(1.2);
        // Improvements
        doc.fontSize(12).fillColor("#dc2626").font("Helvetica-Bold").text("Recommended Enhancements");
        formatted.improvements.forEach((imp) => {
            doc.fontSize(9).fillColor("#374151").font("Helvetica").text(`• ${imp}`, { lineGap: 2 });
        });
        doc.end();
    }
    catch (error) {
        console.error("PDF Export Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate PDF report." });
    }
};
exports.exportPdf = exportPdf;
