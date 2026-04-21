import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  const senderConfigured = Boolean(process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM_NAME);

  return res.status(200).json({ smtpConfigured, senderConfigured });
}
