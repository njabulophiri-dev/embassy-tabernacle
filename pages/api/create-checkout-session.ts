import type { NextApiRequest, NextApiResponse } from "next";

type Frequency = "one_time" | "monthly";

type RequestBody = {
  amount?: unknown;
  frequency?: unknown;
  email?: unknown;
};

type PaystackResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
    plan_code?: string;
  };
};

const MIN_AMOUNT = 1;

// Paystack's transaction limit is R100,000 for ZAR
// because the API limit is 10,000,000 cents.
const MAX_AMOUNT = 100_000;

/**
 * Basic in-process rate limiter.
 *
 * IMPORTANT:
 * This protects a normal Node process, but serverless
 * deployments can create multiple instances.
 *
 * For serious production traffic, replace this with
 * Redis/Upstash or another shared rate limiter.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }

  return req.socket.remoteAddress || "unknown";
}

function isRateLimited(ip: string): boolean {
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

  if (current.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") {
    return false;
  }

  const trimmed = email.trim();

  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function isValidAmount(amount: unknown): amount is number {
  if (typeof amount !== "number") {
    return false;
  }

  if (!Number.isFinite(amount)) {
    return false;
  }

  if (!Number.isInteger(amount)) {
    return false;
  }

  return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
}

function isValidFrequency(frequency: unknown): frequency is Frequency {
  return frequency === "one_time" || frequency === "monthly";
}

function getBaseUrl(req: NextApiRequest): string {
  const configuredUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    const protocol = req.headers["x-forwarded-proto"] || "http";

    const host = req.headers.host || "localhost:3000";

    return `${protocol}://${host}`;
  }

  throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
}

async function paystackRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  const response = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === false) {
    throw new Error(data.message || "Paystack API request failed.");
  }

  return data as T;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Too many payment attempts. Please wait a minute and try again.",
    });
  }

  const body = req.body as RequestBody;

  const amount = body?.amount;
  const frequency = body?.frequency;

  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  // -------------------------------------------------------
  // SERVER-SIDE VALIDATION
  // -------------------------------------------------------

  if (!isValidAmount(amount)) {
    return res.status(400).json({
      error: "Please provide a valid giving amount between R1 and R100,000.",
    });
  }

  if (!isValidFrequency(frequency)) {
    return res.status(400).json({
      error: "Please provide a valid giving frequency.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "Please provide a valid email address.",
    });
  }

  // Convert Rands → cents.
  //
  // Example:
  // R137   → 13700
  // R100   → 10000
  // R6000  → 600000
  const amountInSubunits = Math.round(amount * 100);

  try {
    const baseUrl = getBaseUrl(req);

    const callbackUrl = `${baseUrl}/giving`;

    const metadata = {
      purpose: "church_giving",
      church: "Embassy Tabernacle",
      frequency,
      amount_zar: amount,
      donor_email: email,
    };

    // =======================================================
    // ONE-TIME PAYMENT
    // =======================================================

    if (frequency === "one_time") {
      const paystack = await paystackRequest<PaystackResponse>(
        "/transaction/initialize",
        {
          method: "POST",

          body: JSON.stringify({
            email,

            amount: String(amountInSubunits),

            currency: "ZAR",

            callback_url: callbackUrl,

            metadata: JSON.stringify(metadata),

            channels: [
              "card",
              "bank",
              "apple_pay",
              "ussd",
              "qr",
              "mobile_money",
              "bank_transfer",
              "eft",
              "capitec_pay",
              "payattitude",
            ],
          }),
        },
      );

      const authorizationUrl = paystack.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error("Paystack did not return an authorization URL.");
      }

      return res.status(200).json({
        url: authorizationUrl,
        reference: paystack.data?.reference,
      });
    }

    // =======================================================
    // MONTHLY RECURRING PAYMENT
    // =======================================================

    /**
     * Paystack subscriptions use a Plan.
     *
     * We create a monthly plan using the donor's custom
     * amount, then initialize the first transaction against
     * that plan.
     */

    const plan = await paystackRequest<PaystackResponse>("/plan", {
      method: "POST",

      body: JSON.stringify({
        name: `Embassy Tabernacle Monthly Giving - R${amount}`,

        // Paystack expects the amount in subunits.
        amount: String(amountInSubunits),

        interval: "monthly",

        currency: "ZAR",

        description: "Monthly giving to Embassy Tabernacle Church.",

        send_invoices: true,

        send_sms: false,
      }),
    });

    const planCode = plan.data?.plan_code;

    if (!planCode) {
      throw new Error("Paystack did not return a monthly plan code.");
    }

    /**
     * Initialize the first payment.
     *
     * IMPORTANT:
     * Paystack still requires `amount` here even when
     * `plan` is supplied.
     *
     * The plan amount takes precedence over this amount,
     * but the field itself must still be present.
     */
    const paystack = await paystackRequest<PaystackResponse>(
      "/transaction/initialize",
      {
        method: "POST",

        body: JSON.stringify({
          email,

          // REQUIRED by Paystack even when using a plan.
          amount: String(amountInSubunits),

          // The plan determines the recurring amount.
          plan: planCode,

          currency: "ZAR",

          callback_url: callbackUrl,

          metadata: JSON.stringify({
            ...metadata,
            plan_code: planCode,
          }),

          // Recurring subscriptions are card-based.
          channels: ["card"],
        }),
      },
    );

    const authorizationUrl = paystack.data?.authorization_url;

    if (!authorizationUrl) {
      throw new Error("Paystack did not return an authorization URL.");
    }

    return res.status(200).json({
      url: authorizationUrl,
      reference: paystack.data?.reference,
      planCode,
    });
  } catch (error) {
    console.error("Paystack checkout initialization error:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Unable to create Paystack checkout.",
    });
  }
}
