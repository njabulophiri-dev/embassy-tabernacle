import { NextApiRequest, NextApiResponse } from "next";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not configured");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.setHeader("Allow", "POST").status(405).end("Method Not Allowed");
  }

  const { amount, frequency, email } = req.body as {
    amount?: number;
    frequency?: "one_time" | "monthly";
    email?: string;
  };

  if (!email || !email.includes("@")) {
    return res
      .status(400)
      .json({ error: "Please provide a valid email address." });
  }

  if (!amount || amount < 1) {
    return res.status(400).json({ error: "Please provide a valid amount." });
  }

  if (!frequency || !["one_time", "monthly"].includes(frequency)) {
    return res.status(400).json({ error: "Please provide a valid frequency." });
  }

  const origin =
    req.headers.origin ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100),
          callback_url: `${origin}/giving`,
          metadata: {
            frequency,
            source: "embassy-tabernacle-site",
          },
        }),
      },
    );

    const payload = await response.json();

    if (!response.ok || !payload.status) {
      console.error("Paystack error:", payload);
      return res
        .status(500)
        .json({
          error:
            payload.message || "Unable to initialize Paystack transaction.",
        });
    }

    return res.status(200).json({ url: payload.data.authorization_url });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Unable to initialize Paystack transaction." });
  }
}
