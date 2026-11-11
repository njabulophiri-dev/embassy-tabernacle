import { Redis } from "@upstash/redis";

export type PaystackDonationRecord = {
  reference: string;
  transactionId: number | null;
  amountMinor: number;
  currency: string;
  frequency: string | null;
  planCode: string | null;
  paidAt: string | null;
  recordedAt: string;
};

const redis = Redis.fromEnv();

function isDonationRecord(value: unknown): value is PaystackDonationRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Partial<PaystackDonationRecord>;

  return (
    typeof record.reference === "string" &&
    (typeof record.transactionId === "number" || record.transactionId === null) &&
    typeof record.amountMinor === "number" &&
    typeof record.currency === "string" &&
    (typeof record.frequency === "string" || record.frequency === null) &&
    (typeof record.planCode === "string" || record.planCode === null) &&
    (typeof record.paidAt === "string" || record.paidAt === null) &&
    typeof record.recordedAt === "string"
  );
}

export async function savePaystackDonation(
  donation: PaystackDonationRecord,
): Promise<"stored" | "duplicate"> {
  const key = `paystack:donation:${donation.reference}`;
  const result = await redis.set(key, JSON.stringify(donation), { nx: true });

  if (result === "OK") {
    return "stored";
  }

  const existingValue = await redis.get<string>(key);

  if (typeof existingValue !== "string") {
    throw new Error("Existing Paystack donation record could not be read.");
  }

  let existing: unknown;

  try {
    existing = JSON.parse(existingValue);
  } catch {
    throw new Error("Existing Paystack donation record is invalid.");
  }

  if (!isDonationRecord(existing)) {
    throw new Error("Existing Paystack donation record is invalid.");
  }

  if (
    existing.reference !== donation.reference ||
    existing.transactionId !== donation.transactionId ||
    existing.amountMinor !== donation.amountMinor ||
    existing.currency !== donation.currency
  ) {
    throw new Error("Paystack reference conflicts with an existing donation.");
  }

  return "duplicate";
}
