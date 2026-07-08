import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

type VisitEmailRequestBody = {
  name?: string;
  email?: string;
  message?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as VisitEmailRequestBody;
  const requiredFields = ["name", "email", "message"] as const;

  const missing = requiredFields.filter(
    (field) => !body[field]?.toString().trim(),
  );

  if (missing.length) {
    return res.status(400).json({ error: `Missing: ${missing.join(", ")}` });
  }

  const { name, email, message } = body as Required<VisitEmailRequestBody>;
  const escapedName = escapeHtml(name);
  const escapedEmail = escapeHtml(email);
  const escapedMessage = escapeHtml(message).replace(/\n/g, "<br />");

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [process.env.RESEND_TO_EMAIL || "embassy.tabernacle@gmail.com"],
      subject: "New Plan Your Visit Request",
      html: `
        <h2>New visit request</h2>
        <p><strong>Name:</strong> ${escapedName}</p>
        <p><strong>Email:</strong> ${escapedEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${escapedMessage}</p>
      `,
    });

    return res.status(200).json({ success: true, id: data.data?.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send email." });
  }
}
