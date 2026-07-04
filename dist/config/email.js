"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = void 0;
const resend_1 = require("resend");
if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] ❌ RESEND_API_KEY is not set in .env — emails will NOT be delivered!");
}
else {
    console.log("[EMAIL] ✅ Resend API key loaded. Emails will be delivered.");
}
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
// ─── Send OTP Email ──────────────────────────────────────────────────────────
const sendOtpEmail = async (to, otp) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0E1A;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0E1A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:560px;background-color:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#06B6D4,#3B82F6);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">
                🔐 Password Reset
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Placement Recommendation Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#9CA3AF;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi there,<br><br>
                We received a request to reset your password. Use the verification code below.
                This code is valid for <strong style="color:#06B6D4;">10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#0A0E1A;border:2px solid #06B6D4;border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 8px;color:#6B7280;font-size:11px;letter-spacing:3px;text-transform:uppercase;">
                  Your Verification Code
                </p>
                <p style="margin:0;font-size:48px;font-weight:800;letter-spacing:14px;color:#06B6D4;font-family:monospace;">
                  ${otp}
                </p>
              </div>

              <p style="color:#6B7280;font-size:13px;line-height:1.6;margin:0;">
                ⚠️ <strong style="color:#F59E0B;">Never share this code</strong> with anyone.
                If you didn't request a password reset, you can safely ignore this email — your account is safe.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0D1117;padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;color:#374151;font-size:12px;">
                © ${new Date().getFullYear()} Placement Recommendation Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
    const { data, error } = await resend.emails.send({
        from: "Placement Recommendation <onboarding@resend.dev>",
        to: [to],
        subject: "Your Password Reset Code — Placement Recommendation",
        html,
        text: `Your 6-digit password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    });
    if (error) {
        console.error(`[EMAIL] ❌ Resend error sending to ${to}:`, error);
        throw new Error("Failed to send OTP email. Please try again.");
    }
    console.log(`[EMAIL] ✅ OTP email sent to ${to} (id: ${data?.id})`);
};
exports.sendOtpEmail = sendOtpEmail;
