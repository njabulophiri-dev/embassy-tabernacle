import { useState } from "react";
import { useRouter } from "next/router";

const presetAmounts = [25, 50, 100, 250, 500];
const frequencyOptions = [
  { label: "One-time", value: "one_time" },
  { label: "Monthly", value: "monthly" },
];

const formatCurrency = (value: number) => `R${value.toLocaleString("en-ZA")}`;

export default function Giving() {
  const router = useRouter();
  const success = router.query.success === "true";
  const canceled = router.query.canceled === "true";

  const [amount, setAmount] = useState(100);
  const [frequency, setFrequency] = useState("one_time");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, frequency }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Unable to create checkout session.");
      }

      setCheckoutUrl(body.url);
      window.open(body.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-royal-950/95 p-10 text-white shadow-2xl shadow-black/10 sm:p-12">
          <div className="mb-10 sm:flex sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brightGold">
                Giving with confidence
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Support the mission with secure online giving.
              </h1>
              <p className="mt-4 text-lg text-white/75 sm:text-xl">
                One-time gifts, automated monthly tithing and fast mobile pay
              </p>
            </div>

            <div className="mt-6 rounded-3xl bg-white/5 p-6 text-white/80 sm:mt-0">
              <p className="text-sm uppercase tracking-[0.25em] text-brightGold">
                Stripe powered
              </p>
              <p className="mt-3 leading-7">
                Secure checkout with popular payment methods like cards, Apple
                Pay, Google Pay and more.
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-8 rounded-3xl bg-white/5 p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4 rounded-3xl bg-white/10 p-6">
                  <h2 className="text-xl font-semibold">Choose an amount</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {presetAmounts.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAmount(value)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          amount === value
                            ? "border-brightGold bg-brightGold/10 text-white"
                            : "border-white/10 bg-white/5 text-white/80 hover:border-brightGold hover:bg-white/10"
                        }`}
                      >
                        {formatCurrency(value)}
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm font-semibold text-white/80">
                    Custom amount (R)
                    <input
                      type="number"
                      min={1}
                      value={amount}
                      onChange={(event) =>
                        setAmount(Number(event.target.value))
                      }
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-royal-950/80 px-4 py-3 text-white outline-none transition focus:border-brightGold"
                    />
                  </label>
                </div>

                <div className="space-y-4 rounded-3xl bg-white/10 p-6">
                  <h2 className="text-xl font-semibold">Recurring giving</h2>
                  <p className="text-sm text-white/70">
                    Choose monthly giving for automated tithing. You can stop
                    anytime from your bank or Stripe portal.
                  </p>
                  <div className="grid gap-3">
                    {frequencyOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFrequency(option.value)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          frequency === option.value
                            ? "border-brightGold bg-brightGold/10 text-white"
                            : "border-white/10 bg-white/5 text-white/80 hover:border-brightGold hover:bg-white/10"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-white/10 bg-black/10 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-white/80">
                    Selected gift
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(amount)}
                  </p>
                </div>
                <p className="text-sm text-white/70">
                  You are supporting the church family with a{" "}
                  {frequency === "monthly" ? "monthly" : "one-time"} offering.
                </p>
                {error ? (
                  <p className="rounded-2xl bg-red-600/10 p-3 text-sm text-red-200">
                    {error}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={createSession}
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-2xl bg-brightGold px-6 py-4 text-sm font-semibold text-royal-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Preparing checkout…" : "Give Securely"}
                </button>
              </div>
            </section>

            <aside className="space-y-8 rounded-3xl bg-white/5 p-8">
              <div className="space-y-4 rounded-3xl bg-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-brightGold">
                  Scan to pay
                </p>
                <p className="text-white/80">
                  Open the checkout link on your phone or use the QR code once
                  the secure session is created.
                </p>
                {checkoutUrl ? (
                  <div className="rounded-3xl bg-white/5 p-4 text-center">
                    <img
                      alt="Giving QR code"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                        checkoutUrl,
                      )}`}
                      className="mx-auto"
                    />
                    <p className="mt-4 text-sm text-white/70">
                      Scan this code to complete your offering on mobile.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white/5 p-4 text-white/70">
                    Your checkout QR code will appear here after you choose an
                    amount and press Give Securely.
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-3xl bg-white/10 p-6 text-white/80">
                <p className="text-sm uppercase tracking-[0.25em] text-brightGold">
                  What we accept
                </p>
                <ul className="space-y-3 text-sm leading-7">
                  <li>Credit / debit cards</li>
                  <li>Apple Pay / Google Pay</li>
                  <li>Link and cashier payment methods</li>
                  <li>Recurring monthly offering</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
