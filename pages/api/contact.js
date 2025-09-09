import nodemailer from "nodemailer";

function hasSMTP() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SUPPORT_FROM &&
    process.env.SUPPORT_TO
  );
}

async function getTransporter() {
  if (hasSMTP()) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,           // in-v3.mailjet.com
      port: Number(process.env.SMTP_PORT),   // 587
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  // Dev-only fallback: Ethereal preview (no real mail sent)
  if (process.env.NODE_ENV !== "production" && process.env.USE_ETHEREAL === "true") {
    const test = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: test.user, pass: test.pass },
    });
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const { name, email, message, honeypot } = req.body || {};
  if (honeypot) return res.status(200).json({ ok: true });

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  try {
    const transporter = await getTransporter();
    if (!transporter) {
      return res.status(503).json({ ok: false, error: "Mail service not ready" });
    }

    const info = await transporter.sendMail({
      from: process.env.SUPPORT_FROM || "VIRTUALtrig <no-reply@virtualtrig.com>",
      to: process.env.SUPPORT_TO || "test@virtualtrig.com",
      replyTo: email,
      subject: `Support: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    // Ethereal preview link when using the dev fallback
    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    return res.status(200).json({ ok: true, ...(previewUrl ? { previewUrl } : {}) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Email send failed" });
  }
}
