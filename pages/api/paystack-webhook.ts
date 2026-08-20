import type { NextApiRequest, NextApiResponse } from "next";

import crypto from "crypto";

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

/*
 * In-process duplicate protection.
 *
 * We use Paystack's transaction ID when available and
 * fall back to the transaction reference.
 *
 * IMPORTANT:
 * This is NOT durable across server restarts or multiple
 * serverless instances.
 *
 * For production money processing, persist processed
 * event/reference IDs in a database or Redis.
 */
const processedEvents = new Map<string, number>();

const EVENT_TTL = 24 * 60 * 60 * 1000;

function cleanupProcessedEvents() {
  const now = Date.now();

  for (const [key, timestamp] of processedEvents.entries()) {
    if (now - timestamp > EVENT_TTL) {
      processedEvents.delete(key);
    }
  }
}

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
) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "object") {
    return metadata;
  }

  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
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
    if (data.currency && data.currency.toUpperCase() !== "ZAR") {
      console.warn("Ignoring non-ZAR transaction:", reference);

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

    if (!metadata || metadata.purpose !== "church_giving") {
      console.warn(
        "Ignoring webhook without church-giving metadata:",
        reference,
      );

      return res.status(200).json({
        received: true,
        processed: false,
      });
    }

    cleanupProcessedEvents();

    /*
     * Build a stable idempotency key.
     *
     * Paystack transaction IDs are preferable because
     * they identify the transaction itself.
     */
    const eventKey = data.id
      ? `charge.success:${data.id}`
      : `charge.success:${reference}`;

    /*
     * Duplicate event?
     */
    if (processedEvents.has(eventKey)) {
      console.log(`Duplicate Paystack webhook ignored: ${eventKey}`);

      return res.status(200).json({
        received: true,
        processed: false,
        duplicate: true,
      });
    }

    /*
     * Mark it before processing.
     */
    processedEvents.set(eventKey, Date.now());

    const amount = typeof data.amount === "number" ? data.amount / 100 : null;

    const donorEmail = data.customer?.email || metadata.donor_email || null;

    /*
     * -------------------------------------------------------
     * THIS IS WHERE YOUR REAL PAYMENT PROCESSING GOES.
     * -------------------------------------------------------
     *
     * For now we log the verified transaction.
     *
     * Later this should create/update a persistent
     * donation record in your database.
     */
    console.log("Verified Embassy Tabernacle payment:", {
      event: eventName,
      reference,
      amount,
      currency: data.currency,
      donorEmail,
      frequency: metadata.frequency,
      planCode: metadata.plan_code || data.plan?.plan_code || null,
      paidAt: data.paid_at || null,
    });

    /*
     * IMPORTANT:
     *
     * Do not send sensitive card/authorization information
     * to your logs or email.
     *
     * If we later add donor email notifications, we should
     * process them from a durable donation record.
     */

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
