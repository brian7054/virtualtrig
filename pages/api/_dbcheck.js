// pages/api/_dbcheck.js
import { prisma } from "../../lib/prisma";

export default async function handler(_req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;  // works on SQLite and Postgres
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("DBCHECK_ERROR", err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
