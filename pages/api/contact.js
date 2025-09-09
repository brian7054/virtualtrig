// pages/api/contact.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                // in-v3.mailjet.com
  port: Number(process.env.SMTP_PORT || 587), // 587
  secure: process.env.SMTP_SECURE === "true", // false for 587
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const { name, email, message, honeypot } = req.body || {};
  if (honeypot) return res.status(200).json({ ok: true });
  if (!name || !email || !message) return res.status(400).json({ ok: false, error: "Missing fields" });

  try {
    await transporter.sendMail({
      from: process.env.SUPPORT_FROM,          // 'VIRTUALtrig <support@virtualtrig.com>'
      to: process.env.SUPPORT_TO,              // 'support@virtualtrig.com'
      replyTo: email,
      subject: `Support: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Email send failed" });
  }
}