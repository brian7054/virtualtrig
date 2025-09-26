// pages/api/contact.js
import { prisma } from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name = "", email = "", message = "" } = req.body || {};
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: "Please provide name, email, and message." });
  }

  try {
    // Optional: ensure DB is connected
    // await prisma.$connect();

    const saved = await prisma.message.create({
      data: { name: name.trim(), email: email.trim(), body: message.trim() },
    });
    return res.status(200).json({ ok: true, id: saved.id });
  } catch (err) {
    console.error("CONTACT_SAVE_ERROR", err);
    const detail =
      process.env.NODE_ENV === "development" ? String(err?.message || err) : undefined;
    return res.status(500).json({ error: "Failed to save message.", detail });
  }
}
