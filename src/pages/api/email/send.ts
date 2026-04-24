import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, subject, html, from_name, companyId, customerId, eventType } = req.body || {};
  if (!to || !subject || !html) return res.status(400).json({ error: "Missing required fields" });

  try {
    const admin = getSupabaseAdmin();
    const { data: setting } = await admin
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "smtp_config")
      .maybeSingle();

    const smtp: any = setting?.setting_value || {};
    if (!smtp.host) return res.status(500).json({ error: "SMTP not configured. Set up in Admin > Settings." });

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port || 587),
      secure: Number(smtp.port) === 465,
      auth: { user: smtp.username, pass: smtp.password },
    });

    await transporter.sendMail({
      from: `"${from_name || smtp.senderName || "WorkshopPro"}" <${smtp.senderEmail || smtp.username}>`,
      to,
      subject,
      html,
    });

    if (companyId) {
      await admin.from("communications").insert({
        company_id: companyId,
        customer_id: customerId || null,
        channel: "email",
        direction: "outbound",
        event_type: eventType || "manual_email",
        recipient: to,
        subject,
        body: html,
        status: "sent",
        sent_at: new Date().toISOString(),
      } as any).then(() => null).catch(() => null);
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Email send failed" });
  }
}
