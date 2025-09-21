// pages/api/contact.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name = "", email = "", message = "" } = req.body || {};
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: "Please provide name, email, and message." });
  }

  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_API_SECRET;
  const fromEmail = process.env.EMAIL_FROM || "support@virtualtrig.com";
  const toEmail = process.env.EMAIL_TO || "support@virtualtrig.com";

  if (!key || !secret) {
    return res.status(500).json({ error: "Mailjet keys not configured." });
  }

  // Mailjet v3.1 send endpoint
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const body = {
    Messages: [
      {
        From: { Email: fromEmail, Name: "VIRTUALtrig" },
        To: [{ Email: toEmail, Name: "Support" }],
        Subject: "New message from VIRTUALtrig contact form",
        TextPart: `From: ${name} <${email}>\n\n${message}`,
        HTMLPart: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${escapeHtml(
          message
        )}</p>`,
        ReplyTo: { Email: email, Name: name },
      },
    ],
  };

  try {
    const r = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await r.json().catch(() => ({}));
    if (!r.ok || json?.Messages?.[0]?.Status !== "success") {
      return res
        .status(502)
        .json({ error: "Mail sending failed.", detail: json || (await r.text()) });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error.", detail: String(err) });
  }
}

// tiny HTML escape for the HTMLPart
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
