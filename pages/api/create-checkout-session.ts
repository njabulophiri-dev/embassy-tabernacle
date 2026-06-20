import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

const pricingMetadata = {
  name: "Church Giving",
  description: "Support Embassy Tabernacle with a secure online gift.",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.setHeader("Allow", "POST").status(405).end("Method Not Allowed");
  }

  const { amount, frequency } = req.body as {
    amount?: number;
    frequency?: "one_time" | "monthly";
  };

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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: frequency === "monthly" ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: pricingMetadata,
            unit_amount: amount * 100,
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
