import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

const pricingMetadata = {
  name: "Church Giving",
  description: "Support Embassy Tabernacle with a secure online gift.",
};

type CheckoutSessionRequestBody = {
  amount?: number;
  frequency?: "one_time" | "monthly";
};

type CheckoutSessionRequestBodyRequired = Required<CheckoutSessionRequestBody>;

function hasValidCheckoutSessionBody(
  body: CheckoutSessionRequestBody,
): body is CheckoutSessionRequestBodyRequired {
  return (
    typeof body.amount === "number" && body.amount >= 1 &&
    (body.frequency === "one_time" || body.frequency === "monthly")
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.setHeader("Allow", "POST").status(405).end("Method Not Allowed");
  }

  const body = req.body as CheckoutSessionRequestBody;

  if (!hasValidCheckoutSessionBody(body)) {
    return res.status(400).json({ error: "Please provide a valid amount and frequency." });
  }

  const { amount, frequency } = body;

  const origin =
    req.headers.origin ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: frequency === "monthly" ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: "zar",
            product_data: pricingMetadata,
            unit_amount: Math.round(amount * 100),
            recurring:
              frequency === "monthly" ? { interval: "month" } : undefined,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/giving?success=true`,
      cancel_url: `${origin}/giving?canceled=true`,
      metadata: {
        frequency,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Unable to create Stripe checkout session." });
  }
}
