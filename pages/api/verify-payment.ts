import type { NextApiRequest, NextApiResponse } from "next";

type PaystackMetadata =
  | string
  | {
      purpose?: string;
      church?: string;
      frequency?: string;
      amount_zar?: number;
      donor_email?: string;
      plan_code?: string;
    }
  | null;

type PaystackTransaction = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  metadata: PaystackMetadata;
  customer?: {
    email?: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: PaystackTransaction;
};

/*
 * Basic in-process rate limiter.
 *
 * Replace with Redis/Upstash for serious production
 * traffic because serverless instances don't share memory.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 20;

function getClientIp(req: NextApiRequest) {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }

  return req.socket.remoteAddress || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || now >= current.resetAt) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });

    return false;
  }

  current.count += 1;

  return current.count > RATE_LIMIT_MAX;
}

function parseMetadata(metadata: PaystackMetadata): Record<string, unknown> | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      const parsed: unknown = JSON.parse(metadata);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }

  return Array.isArray(metadata)
    ? null
    : (metadata as Record<string, unknown>);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Too many verification attempts. Please try again later.",
    });
  }

  const reference =
    typeof req.query.reference === "string" ? req.query.reference.trim() : "";

  /*
   * Paystack references are alphanumeric and may contain
   * -, . or = according to their API.
   */
  if (
    !reference ||
    reference.length > 100 ||
    !/^[A-Za-z0-9_.=-]+$/.test(reference)
  ) {
    return res.status(400).json({
      error: "Invalid transaction reference.",
    });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is not configured.");

    return res.status(500).json({
      error: "Payment verification is unavailable.",
    });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${secretKey}`,
          Accept: "application/json",
        },
      },
    );

    const body: PaystackVerifyResponse = await response.json();

    if (!response.ok || !body.status) {
      return res.status(400).json({
        success: false,
        message: body.message || "Unable to verify transaction.",
      });
    }

    const transaction = body.data;

    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: "Paystack returned no transaction data.",
      });
    }

    if (transaction.reference !== reference) {
      return res.status(400).json({
        success: false,
        message: "The transaction reference could not be verified.",
      });
    }

    /*
     * NEVER treat the callback itself as success.
     */
    if (transaction.status !== "success") {
      return res.status(200).json({
        success: false,
        status: transaction.status,
        reference: transaction.reference,
        message: "The transaction was not successful.",
      });
    }

    /*
     * Make sure we're dealing with ZAR.
     */
    if (transaction.currency?.toUpperCase() !== "ZAR") {
      console.error("Unexpected transaction currency:", transaction.currency);

      return res.status(400).json({
        success: false,
        message: "Transaction currency could not be verified.",
      });
    }

    /*
     * Make sure this transaction was created by
     * our church-giving flow.
     */
    const metadata = parseMetadata(transaction.metadata);

    if (
      !metadata ||
      metadata.purpose !== "church_giving" ||
      typeof metadata.amount_zar !== "number" ||
      !Number.isSafeInteger(metadata.amount_zar) ||
      metadata.amount_zar * 100 !== transaction.amount
    ) {
      console.error(
        "Transaction failed giving metadata validation:",
        transaction.reference,
      );

      return res.status(400).json({
        success: false,
        message:
          "This transaction does not belong to the church giving system.",
      });
    }

    const amount = transaction.amount / 100;

    if (
      !Number.isSafeInteger(transaction.amount) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "The transaction amount could not be verified.",
      });
    }

    /*
     * Return only what the frontend needs.
     *
     * Do NOT return authorization/card details.
     */
    return res.status(200).json({
      success: true,
      status: "success",

      reference: transaction.reference,

      amount: transaction.amount,

      data: {
        status: transaction.status,
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify the payment.",
    });
  }
}
