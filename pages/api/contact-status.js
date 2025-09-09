export default function handler(req, res) {
  const ready = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SUPPORT_FROM &&
    process.env.SUPPORT_TO
  );
  res.status(200).json({ ready });
}
