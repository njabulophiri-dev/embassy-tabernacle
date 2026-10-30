import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import {
  eventDates,
  isPastEventDate,
  pastEventIds,
} from "../../lib/event-dates";

type RegistrationRequest = {
  eventId?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  guests?: unknown;
  consent?: unknown;
};

const eventNames: Record<string, string> = {
  "b4ileave-varsity-summit": "B4iLeave Varsity Summit",
  "night-prayer": "Night Prayer",
  "singles-service": "Singles Service",
  "first-sunday-service": "First Sunday Service",
  "passover-conference": "Passover Conference",
};

const registrationAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return req.socket.remoteAddress || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  if (registrationAttempts.size > 500) {
    for (const [address, attempt] of registrationAttempts) {
      if (now >= attempt.resetAt) registrationAttempts.delete(address);
    }
  }

  const current = registrationAttempts.get(ip);

  if (!current || now >= current.resetAt) {
    registrationAttempts.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function isRecord(value: unknown): value is RegistrationRequest {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (isRateLimited(getClientIp(req))) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again in a minute." });
  }

  if (!isRecord(req.body)) {
    return res.status(400).json({ error: "Invalid registration details." });
  }

  const { eventId, name, email, phone, guests, consent } = req.body;
  const validEventId =
    typeof eventId === "string" && eventNames[eventId] ? eventId : undefined;
  const eventName = validEventId ? eventNames[validEventId] : undefined;
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
  const guestCount = typeof guests === "string" ? Number(guests) : NaN;

  if (!eventName) {
    return res.status(400).json({ error: "Please select a valid event." });
  }

  if (
    validEventId &&
    (pastEventIds.has(validEventId) || isPastEventDate(eventDates[validEventId]))
  ) {
    return res.status(410).json({ error: "Registration for this event has closed." });
  }

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return res
      .status(400)
      .json({ error: "Please enter a name between 2 and 100 characters." });
  }

  if (
    trimmedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
  ) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  if (
    trimmedPhone.length > 30 ||
    (trimmedPhone !== "" && !/^[+()\d\s.-]+$/.test(trimmedPhone))
  ) {
    return res.status(400).json({ error: "Please enter a valid phone number." });
  }

  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 5) {
    return res.status(400).json({ error: "Please select a valid guest count." });
  }

  if (consent !== true) {
    return res.status(400).json({ error: "Please confirm consent to be contacted." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Event registration email is not configured: missing RESEND_API_KEY.");
    return res
      .status(503)
      .json({ error: "Registration is temporarily unavailable. Please try again later." });
  }

  const html = `
    <h2>New event interest registration</h2>
    <p><strong>Event:</strong> ${escapeHtml(eventName)}</p>
    <p><strong>Name:</strong> ${escapeHtml(trimmedName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(trimmedEmail)}</p>
    <p><strong>Phone:</strong> ${trimmedPhone ? escapeHtml(trimmedPhone) : "Not provided"}</p>
    <p><strong>People interested:</strong> ${guestCount === 5 ? "5 or more" : guestCount}</p>
  `;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [process.env.RESEND_TO_EMAIL || "embassy.tabernacle@gmail.com"],
      replyTo: trimmedEmail,
      subject: `New event interest: ${eventName}`,
      html,
    });

    if (error) {
      console.error("Failed to send event registration email:", error);
      return res.status(502).json({
        error: "We couldn't send your registration. Please try again later.",
      });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Failed to send event registration email:", error);
    return res.status(500).json({
      error: "We couldn't send your registration. Please try again later.",
    });
  }
}
