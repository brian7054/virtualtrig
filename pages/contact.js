import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,         // e.g. smtp-relay.brevo.com or in-v3.mailjet.com
  port: Number(process.env.SMTP_PORT), // 587 (STARTTLS) or 465 (SSL)
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const { name, email, message, honeypot } = req.body || {};
  if (honeypot) return res.status(200).json({ ok: true });

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  try {
    await transporter.sendMail({
      from: process.env.SUPPORT_FROM,           // e.g., 'VIRTUALtrig <support@virtualtrig.com>'
      to: process.env.SUPPORT_TO,               // 'support@virtualtrig.com'
      replyTo: email,
      subject: `Support: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Email send failed" });
  }
}
