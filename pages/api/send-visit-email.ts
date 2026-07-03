import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message?: string;
  };

  const missing = ["name", "email", "message"].filter(
    (field) => !req.body[field]?.toString().trim(),
  );

  if (missing.length) {
    return res.status(400).json({ error: `Missing: ${missing.join(", ")}` });
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [process.env.RESEND_TO_EMAIL || "embassy.tabernacle@gmail.com"],
      subject: "New Plan Your Visit Request",
      html: `
        <h2>New visit request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    });

    return res.status(200).json({ success: true, id: data.data?.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send email." });
  }
}
