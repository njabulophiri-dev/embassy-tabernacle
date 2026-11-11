import type { NextApiRequest, NextApiResponse } from "next";

import crypto from "crypto";
import { savePaystackDonation } from "../../lib/paystack-donation-store";

export const config = {
  api: {
    bodyParser: false,
  },
};

type PaystackWebhookEvent = {
  event?: string;

  data?: {
    id?: number;
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    paid_at?: string;
    created_at?: string;

    customer?: {
      email?: string;
      customer_code?: string;
    };

    metadata?:
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

    plan?: {
      plan_code?: string;
      name?: string;
      amount?: number;
      interval?: string;
    };
  };
};

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

function getSignature(req: NextApiRequest) {
  const signature = req.headers["x-paystack-signature"];

  if (Array.isArray(signature)) {
    return signature[0];
  }

  return signature;
}

function verifySignature(rawBody: Buffer, signature: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  const expectedSignature = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  /*
   * timingSafeEqual requires buffers of the same
   * length.
   */
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function parseMetadata(
  metadata: NonNullable<PaystackWebhookEvent["data"]>["metadata"],
): Record<string, unknown> | null {
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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  try {
    const rawBody = await getRawBody(req);

    if (!rawBody.length) {
      return res.status(400).json({
        error: "Empty webhook body.",
      });
    }

    const signature = getSignature(req);

    if (!signature) {
      console.warn("Paystack webhook received without signature.");

      return res.status(401).json({
        error: "Missing signature.",
      });
    }

    /*
     * Authenticate the webhook BEFORE parsing or
     * processing the event.
     */
    const validSignature = verifySignature(rawBody, signature);

    if (!validSignature) {
      console.warn("Invalid Paystack webhook signature.");

      return res.status(401).json({
        error: "Invalid signature.",
      });
    }

    let event: PaystackWebhookEvent;

    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({
        error: "Invalid JSON payload.",
      });
    }

    const eventName = event.event;

    /*
     * We currently care about successful charges.
     *
     * This includes recurring subscription charges.
     */
    if (eventName !== "charge.success") {
      console.log(`Paystack webhook ignored: ${eventName}`);

      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    const data = event.data;

    if (!data) {
      return res.status(400).json({
        error: "Missing event data.",
      });
    }

    const reference = data.reference;

    if (!reference) {
      return res.status(400).json({
        error: "Missing transaction reference.",
      });
    }

    /*
     * Validate successful transaction.
     */
    if (data.status !== "success") {
      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    /*
     * Validate currency.
     */
    if (
      typeof data.currency !== "string" ||
      data.currency.toUpperCase() !== "ZAR"
    ) {
      console.warn("Ignoring non-ZAR transaction:", reference);

      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    if (
      typeof data.amount !== "number" ||
      !Number.isSafeInteger(data.amount) ||
      data.amount <= 0
    ) {
      console.warn("Ignoring invalid transaction amount:", reference);

      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    /*
     * Validate that this transaction came from
     * our church-giving flow.
     */
    const metadata = parseMetadata(data.metadata);

    if (
      !metadata ||
      metadata.purpose !== "church_giving" ||
      typeof metadata.amount_zar !== "number" ||
      !Number.isSafeInteger(metadata.amount_zar) ||
      metadata.amount_zar * 100 !== data.amount
    ) {
      console.warn(
        "Ignoring webhook without church-giving metadata:",
        reference,
      );

      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    const result = await savePaystackDonation({
      reference,
      transactionId: data.id ?? null,
      amountMinor: data.amount,
      currency: data.currency,
      frequency:
        typeof metadata.frequency === "string" ? metadata.frequency : null,
      planCode:
        (typeof metadata.plan_code === "string" && metadata.plan_code) ||
        data.plan?.plan_code ||
        null,
      paidAt: data.paid_at || null,
      recordedAt: new Date().toISOString(),
    });

    if (result === "duplicate") {
      console.log(`Duplicate Paystack webhook ignored: ${reference}`);

      return res.status(200).json({
        received: true,
        processed: false,
        duplicate: true,
      });
    }

    console.log("Verified Embassy Tabernacle payment recorded:", reference);

    return res.status(200).json({
      received: true,
      processed: true,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    /*
     * Returning non-200 causes Paystack to retry the event.
     *
     * This is desirable when our server actually failed
     * before processing the event.
     */
    return res.status(500).json({
      error: "Webhook processing failed.",
    });
  }
}
