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
  if (req.method !== "GET") {
    return res.setHeader("Allow", "GET").status(405).end("Method Not Allowed");
  }

  const { reference, trxref } = req.query as {
    reference?: string | string[];
    trxref?: string | string[];
  };

  const paymentReference =
    typeof reference === "string"
      ? reference
      : typeof trxref === "string"
        ? trxref
        : null;

  if (!paymentReference) {
    return res.status(400).json({ error: "Missing payment reference." });
  }

  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(
        paymentReference,
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const payload = await response.json();

    if (!response.ok || !payload.status) {
      console.error("Paystack verification error:", payload);
      return res
        .status(500)
        .json({ error: payload.message || "Unable to verify payment." });
    }

    const verified = payload.data.status === "success";
    return res.status(200).json({ verified, payment: payload.data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to verify payment." });
  }
}
